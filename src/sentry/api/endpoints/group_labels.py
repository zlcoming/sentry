from __future__ import absolute_import

from sentry.api.bases.group import GroupEndpoint
from sentry.api.paginator import OffsetPaginator
from sentry.api.serializers import serialize
from sentry.models import IssueLabel


class GroupLabelsEndpoint(GroupEndpoint):
    def get(self, request, group):
        """
        Gets labels associated with a specific group/issue
        """
        labels = IssueLabel.objects.filter(issue=group)

        return self.paginate(
            request,
            queryset=labels,
            paginator_cls=OffsetPaginator,
            on_results=lambda x: serialize(x, request.user),
            default_per_page=25,
        )
