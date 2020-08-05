from __future__ import absolute_import

from rest_framework.response import Response

from sentry.api.bases.group import GroupEndpoint
from sentry.api.serializers import serialize
from sentry.models import IssueLabel


class GroupLabelsEndpoint(GroupEndpoint):
    def get(self, request, group):
        try:
            labels = IssueLabel.objects.get(issue=group)
        except IssueLabel.DoesNotExist:
            labels = []
        return Response(serialize(labels))
