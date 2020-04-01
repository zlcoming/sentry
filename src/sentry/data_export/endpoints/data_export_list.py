from __future__ import absolute_import

from rest_framework.response import Response

from sentry import features
from sentry.api.bases.organization import OrganizationEndpoint, OrganizationDataExportPermission
from sentry.api.paginator import OffsetPaginator
from sentry.api.serializers import serialize
from sentry.utils import metrics

from ..models import ExportedData


class DataExportListEndpoint(OrganizationEndpoint):
    permission_classes = (OrganizationDataExportPermission,)

    def get(self, request, organization, **kwargs):
        """
        Retrieve information about exports made by a given organization
        """

        # Ensure new data-export features are enabled
        if not features.has("organizations:data-export", organization):
            return Response(status=404)
        metrics.incr("dataexport.list", tags={"organization_id": organization.id})
        queryset = ExportedData.objects.filter(organization_id=organization.id)
        return self.paginate(
            request=request,
            queryset=queryset,
            order_by="-date_added",
            on_results=lambda x: serialize(x, request.user),
            paginator_cls=OffsetPaginator,
            default_per_page=25,
        )
