from __future__ import absolute_import

from django import forms

# from sentry.models import Project, User
from sentry.rules.actions.base import EventAction
from sentry.models import IssueLabel


def get_label_choices(organization):
    labels = organization.label_set.all()
    return [(label.id, label.name) for label in labels]


def get_label_options(organization):
    labels = organization.label_set.all()
    return [{"value": label.id, "label": label.name, "color": label.color} for label in labels]


def assign_label(event, futures):
    from sentry.api.endpoints.organization_labels import IssueLabelSerializer

    for future in futures:
        kwargs = future.kwargs
        if "label_id" not in kwargs or "issue_id" not in kwargs:
            return
        issue_label_data = {"label": kwargs["label_id"], "issue": kwargs["issue_id"]}

        existing_label = IssueLabel.objects.filter(**issue_label_data)
        if existing_label:
            return

        serializer = IssueLabelSerializer(data=issue_label_data)

        if serializer.is_valid():
            serializer.save()


class LabelIssueForm(forms.Form):
    label = forms.ChoiceField(choices=())

    def __init__(self, project, *args, **kwargs):
        super(LabelIssueForm, self).__init__(*args, **kwargs)
        self.project = project
        self.fields["label"].choices = get_label_choices(project.organization)


class LabelIssueAction(EventAction):
    form_cls = LabelIssueForm
    label = "Label the issue as {label}"
    prompt = "Label the issue"

    def __init__(self, *args, **kwargs):
        super(LabelIssueAction, self).__init__(*args, **kwargs)
        label_options = get_label_options(self.project.organization)
        self.form_fields = {"label": {"type": "labelAction", "choices": label_options}}

    def after(self, event, state):
        label_id = self.get_option("label")
        issue_id = event.group_id

        extra = {"event_id": event.event_id}
        if not label_id:
            self.logger.info("rules.fail.is_configured", extra=extra)
            return

        kwargs = {"label_id": int(label_id), "issue_id": int(issue_id)}
        yield self.future(assign_label, **kwargs)

    def get_form_instance(self):
        return self.form_cls(self.project, self.data)
