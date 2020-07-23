from __future__ import absolute_import

import math
import sentry_sdk
import six

from rest_framework.response import Response

from sentry.api.bases import OrganizationEventsEndpointBase, NoProjects
from sentry.snuba import discover


class OrganizationEventsTrends(OrganizationEventsEndpointBase):
    def get(self, request, organization):
        if not self.has_feature(organization, request):
            return Response(status=404)

        with sentry_sdk.start_span(op="discover.endpoint", description="filter_params") as span:
            span.set_data("organization", organization)
            try:
                params = self.get_filter_params(request, organization)
            except NoProjects:
                return Response(status=404)
            params = self.quantize_date_params(request, params)

            start = params["start"]
            end = params["end"]
            middle = start + (end - start) / 2
            first_interval = (
                request.GET.get("firstStart", start).isoformat()[:19],
                request.GET.get("firstEnd", middle).isoformat()[:19],
            )
            second_interval = (
                request.GET.get("secondStart", middle).isoformat()[:19],
                request.GET.get("secondEnd", end).isoformat()[:19],
            )

        trend_function = request.GET.get("trendFunction", "p50()")
        results = discover.query(
            orderby=request.GET.get(
                "orderby", ["divide_aggregateRange_2_aggregateRange_1", "transaction"]
            ),
            referrer="api.trends.get_percentage_change",
            selected_columns=request.GET.getlist("field")[:]
            + [
                "divide(aggregateRange_2,aggregateRange_1)",
                "minus(aggregateRange_2,aggregateRange_1)",
                "divide(count_2,count_1)",
            ],
            query="event.type:transaction " + request.GET.get("query"),
            params=params,
            limit=50,
            auto_fields=True,
            use_aggregate_conditions=True,
            trend_function=trend_function,
            first_interval=first_interval,
            second_interval=second_interval,
        )
        """
        snuba_filter = get_filter(request.GET.get("query"), params)
        # TODO: add params for epm/eps (or make the decision to exclude them)
        snuba_filter.update_with(
            resolve_field_list(request.GET.getlist("field"), snuba_filter)
        )
        for having_clause in snuba_filter.having:
            found = any(
                having_clause[0] == agg_clause[-1] for agg_clause in snuba_filter.aggregations
            )
            if not found:
                raise InvalidSearchQuery(
                    u"Aggregate {} used in a condition but is not a selected column.".format(
                        having_clause[0]
                    )
                )

        results = raw_query(
            filter_keys={"project_id": params.get("project_id")},
            start=params.get("start"),
            end=params.get("end"),
            dataset=Dataset.Discover,
            aggregations=snuba_filter.aggregations,
            selected_columns=snuba_filter.selected_columns,
            conditions=snuba_filter.conditions,
            having=snuba_filter.having,
            groupby=snuba_filter.groupby,
            limit=5,
            orderby=request.GET.get("orderby", ["percentage", "transaction"]),
            referrer="api.trends.get_percentage_change",
        )
        """
        response = []
        for result in results["data"]:
            response.append(
                {
                    key: (
                        value
                        if not (
                            isinstance(value, float) and (math.isnan(value) or math.isinf(value))
                        )
                        else None
                    )
                    for key, value in six.iteritems(result)
                }
            )
        return Response(response)

        # with self.handle_query_errors():
        #    result = discover.trends(
        #        selected_columns=[
        #            "transaction",
        #        ],
        #        params=params,
        #        query=request.GET.get("query"),
        #        limit=1,
        #        referrer="api.transaction-baseline.get_value",
        #    )
