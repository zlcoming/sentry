from __future__ import absolute_import

import logging
import sentry_sdk

from django import forms

from sentry.models import Integration
from sentry.rules.actions.base import EventAction
from sentry.utils import metrics

logger = logging.getLogger("sentry.rules")


class AzureDevopsNotifyServiceForm(forms.Form):
    # TODO 2.0 Add form fields.

    def __init__(self, *args, **kwargs):
        super(AzureDevopsNotifyServiceForm, self).__init__(*args, **kwargs)

    def clean(self):
        return super(AzureDevopsNotifyServiceForm, self).clean()


class AzureDevopsCreateTicketAction(EventAction):
    form_cls = AzureDevopsNotifyServiceForm
    label = u"TODO Create a AzureDevops workitem"
    prompt = "Create a AzureDevops workitem"

    def __init__(self, *args, **kwargs):
        super(AzureDevopsCreateTicketAction, self).__init__(*args, **kwargs)
        # TODO 2.1 Add form_fields
        self.form_fields = {}

    def is_enabled(self):
        # TODO move to superclass
        return self.get_integrations().exists()

    def after(self, event, state):
        integration_id = None
        try:
            integration = Integration.objects.get(
                provider="azure_devops", organizations=self.project.organization, id=integration_id
            )
        except Integration.DoesNotExist:
            # Integration removed, rule still active.
            return

        def send_notification(event, futures):
            with sentry_sdk.start_transaction(
                op=u"azure_devops.send_notification", name=u"AzureDevopsSendNotification", sampled=1.0
            ) as span:
                pass

        key = u"azure_devops:{}:{}".format(integration_id, "TODO")

        metrics.incr("notifications.sent", instance="azure_devops.notification", skip_internal=False)
        yield self.future(send_notification, key=key)

    def render_label(self):
        integration_id = None
        try:
            integration_name = Integration.objects.get(
                provider="vsts",
                organizations=self.project.organization,
                id=integration_id,
            ).name
        except Integration.DoesNotExist:
            integration_name = "[removed]"

        return self.label.format()

    def get_integrations(self):
        return Integration.objects.filter(provider="vsts", organizations=self.project.organization)

    def get_form_instance(self):
        return self.form_cls(
            self.data, integrations=self.get_integrations()
        )
