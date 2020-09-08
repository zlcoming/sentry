from __future__ import absolute_import

from rest_framework import status
from rest_framework.response import Response

from sentry.api.bases.project import ProjectEndpoint, ProjectSettingPermission
from sentry.api.exceptions import ResourceDoesNotExist
from sentry.api.serializers import serialize
from sentry.api.serializers.rest_framework.rule import RuleSerializer
from sentry.integrations.slack import tasks
from sentry.mediators import project_rules
from sentry.models import AuditLogEntryEvent, Rule, RuleActivity, RuleActivityType, RuleStatus
from sentry.web.decorators import transaction_start
from sentry.utils import metrics
from sentry import features
from sentry.constants import SENTRY_NEW_FILTERS


class ProjectRuleDetailsEndpoint(ProjectEndpoint):
    permission_classes = [ProjectSettingPermission]

    def convert_args(self, request, rule_id, *args, **kwargs):
        args, kwargs = super(ProjectRuleDetailsEndpoint, self).convert_args(
            request, *args, **kwargs
        )
        project = kwargs["project"]

        if not rule_id.isdigit():
            raise ResourceDoesNotExist

        try:
            kwargs["rule"] = Rule.objects.get(
                project=project, id=rule_id, status__in=[RuleStatus.ACTIVE, RuleStatus.INACTIVE]
            )
        except Rule.DoesNotExist:
            raise ResourceDoesNotExist

        return args, kwargs

    @transaction_start("ProjectRuleDetailsEndpoint")
    def get(self, request, project, rule):
        """
        Retrieve a rule

        Return details on an individual rule.

            {method} {path}

        """
        data = serialize(rule, request.user)

        return Response(data)

    @transaction_start("ProjectRuleDetailsEndpoint")
    def put(self, request, project, rule):
        """
        Update a rule

        Update various attributes for the given rule.

            {method} {path}
            {{
              "name": "My rule name",
              "conditions": [],
              "filters": [],
              "actions": [],
              "actionMatch": "all",
              "filterMatch": "all"
            }}

        """
        serializer = RuleSerializer(context={"project": project}, data=request.data, partial=True)

        if serializer.is_valid():
            data = serializer.validated_data

            # combine filters and conditions into one conditions criteria for the rule object
            conditions = data["conditions"]
            if "filters" in data:
                conditions.extend(data["filters"])

            kwargs = {
                "name": data["name"],
                "environment": data.get("environment"),
                "project": project,
                "action_match": data["actionMatch"],
                "filter_match": data.get("filterMatch"),
                "conditions": conditions,
                "actions": data["actions"],
                "frequency": data.get("frequency"),
            }

            if data.get("pending_save"):
                client = tasks.RedisRuleStatus()
                kwargs.update({"uuid": client.uuid, "rule_id": rule.id})
                tasks.find_channel_id_for_rule.apply_async(kwargs=kwargs)

                context = {"uuid": client.uuid}
                return Response(context, status=202)

            updated_rule = project_rules.Updater.run(rule=rule, request=request, **kwargs)
            RuleActivity.objects.create(
                rule=updated_rule, user=request.user, type=RuleActivityType.UPDATED.value
            )
            self.create_audit_entry(
                request=request,
                organization=project.organization,
                target_object=updated_rule.id,
                event=AuditLogEntryEvent.RULE_EDIT,
                data=updated_rule.get_audit_log_data(),
            )
            if features.has(
                "organizations:alert-filters", project.organization, actor=request.user
            ):
                new_filters = [
                    condition.id for condition in conditions if condition.id in SENTRY_NEW_FILTERS
                ]
                # record if the user used any of the new filters
                if new_filters:
                    tags = {new_filter: True for new_filter in new_filters}
                    metrics.incr(
                        "alert.filters.new-filter-rule-editted", tags=tags, sample_rate=1.0
                    )

            return Response(serialize(updated_rule, request.user))

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @transaction_start("ProjectRuleDetailsEndpoint")
    def delete(self, request, project, rule):
        """
        Delete a rule
        """
        rule.update(status=RuleStatus.PENDING_DELETION)
        RuleActivity.objects.create(
            rule=rule, user=request.user, type=RuleActivityType.DELETED.value
        )
        self.create_audit_entry(
            request=request,
            organization=project.organization,
            target_object=rule.id,
            event=AuditLogEntryEvent.RULE_REMOVE,
            data=rule.get_audit_log_data(),
        )
        return Response(status=202)
