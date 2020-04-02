from __future__ import absolute_import

import json
from rest_framework.response import Response

from sentry import features
from sentry.api.bases.organization import OrganizationEndpoint, OrganizationDataExportPermission
from sentry.api.paginator import OffsetPaginator
from sentry.api.serializers import serialize
from sentry.utils import metrics

from ..base import ExportQueryType
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
        query = request.query_params
        if query.get("check_existance"):
            return self.check_existance(request, organization)
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

    def check_existance(self, request, organization):
        query_info = json.loads(request.query_params.get("query_info"))
        query_type = ExportQueryType.from_str(request.query_params.get("query_type"))
        queryset = ExportedData.objects.filter(
            user_id=request.user.id,
            organization_id=organization.id,
            query_type=query_type,
            query_info=query_info,
            date_finished__isnull=True,
        )
        return Response(len(queryset) > 0)
