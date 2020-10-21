from __future__ import absolute_import

import logging
import sentry_sdk

from django import forms

from sentry.models import Integration
from sentry.rules.actions.base import EventAction
from sentry.utils import metrics

logger = logging.getLogger("sentry.rules")


class JiraNotifyServiceForm(forms.Form):
    # TODO 1.0 Add form fields.

    def __init__(self, *args, **kwargs):
        super(JiraNotifyServiceForm, self).__init__(*args, **kwargs)

    def clean(self):
        return super(JiraNotifyServiceForm, self).clean()


class JiraCreateTicketAction(EventAction):
    form_cls = JiraNotifyServiceForm
    label = u"TODO Create a Jira ticket"
    prompt = "Create a Jira ticket"

    def __init__(self, *args, **kwargs):
        super(JiraCreateTicketAction, self).__init__(*args, **kwargs)
        # TODO 1.1 Add form_fields
        self.form_fields = {}

    def is_enabled(self):
        # TODO move to superclass
        return self.get_integrations().exists()

    def after(self, event, state):
        integration_id = None
        try:
            integration = Integration.objects.get(
                provider="jira", organizations=self.project.organization, id=integration_id
            )
        except Integration.DoesNotExist:
            # Integration removed, rule still active.
            return

        def send_notification(event, futures):
            with sentry_sdk.start_transaction(
                op=u"jira.send_notification", name=u"JiraSendNotification", sampled=1.0
            ) as span:
                pass

        key = u"jira:{}:{}".format(integration_id, "TODO")

        metrics.incr("notifications.sent", instance="jira.notification", skip_internal=False)
        yield self.future(send_notification, key=key)

    def render_label(self):
        integration_id = None
        try:
            integration_name = Integration.objects.get(
                provider="jira",
                organizations=self.project.organization,
                id=integration_id,
            ).name
        except Integration.DoesNotExist:
            integration_name = "[removed]"

        return self.label.format()

    def get_integrations(self):
        return Integration.objects.filter(provider="jira", organizations=self.project.organization)

    def get_form_instance(self):
        return self.form_cls(
            self.data, integrations=self.get_integrations()
        )
