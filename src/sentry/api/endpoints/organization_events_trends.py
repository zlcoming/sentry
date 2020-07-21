from __future__ import absolute_import

import math
import sentry_sdk
import six

from rest_framework.response import Response

from sentry.api.bases import OrganizationEventsEndpointBase, NoProjects
from sentry.api.event_search import resolve_function
from sentry.utils.snuba import raw_query, Dataset


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
        # TODO: add params for epm/eps (or make the decision to exclude them)
        _, agg_additions = resolve_function(trend_function)
        range_format = "{aggregate}({column},and(greaterOrEquals(timestamp,toDateTime('{start}')),less(timestamp,toDateTime('{end}'))))"
        aggregate, column, _ = agg_additions[0]
        column = "duration"
        if "(" in aggregate:
            aggregate = aggregate.replace("(", "If(")
        else:
            aggregate += "If"
        aggregations = [
            [
                range_format.format(
                    aggregate=aggregate,
                    start=first_interval[0],
                    end=first_interval[1],
                    column=column,
                ),
                None,
                "aggregateRange_1",
            ],
            [
                range_format.format(
                    aggregate=aggregate,
                    start=second_interval[0],
                    end=second_interval[1],
                    column=column,
                ),
                None,
                "aggregateRange_2",
            ],
        ]
        selected_columns = [
            ["divide", ["aggregateRange_2", "aggregateRange_1"], "percentage"],
            ["minus", ["aggregateRange_2", "aggregateRange_1"], "delta"],
            "transaction",
        ]

        results = raw_query(
            filter_keys={"project_id": params.get("project_id")},
            start=params.get("start"),
            end=params.get("end"),
            dataset=Dataset.Discover,
            aggregations=aggregations,
            selected_columns=selected_columns,
            groupby="transaction",
            limit=5,
            conditions=[["type", "=", "transaction"]],
            orderby=request.GET.get("orderby", ["percentage", "transaction"]),
            referrer="api.trends.get_percentage_change",
        )
        response = []
        for result in results["data"]:
            response.append(
                {
                    key: (value if not (isinstance(value, float) and math.isnan(value)) else None)
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
