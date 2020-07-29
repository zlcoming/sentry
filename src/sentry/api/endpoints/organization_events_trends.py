from __future__ import absolute_import

import math
import sentry_sdk
import six

from datetime import timedelta
from rest_framework.response import Response

from sentry.api.bases import OrganizationEventsEndpointBase, NoProjects
from sentry.api.event_search import resolve_function
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
            middle = start + timedelta(
                seconds=(end - start).total_seconds()
                / (1 / float(request.GET.get("intervalRatio", 0.5)))
            )
            first_interval = (
                request.GET.get("firstStart", start).isoformat()[:19],
                request.GET.get("firstEnd", middle).isoformat()[:19],
            )
            second_interval = (
                request.GET.get("secondStart", middle).isoformat()[:19],
                request.GET.get("secondEnd", end).isoformat()[:19],
            )

        trend_function = request.GET.get("trendFunction", "p50()")
        if "misery" not in trend_function:
            _, agg_additions = resolve_function(trend_function)
            aggregate, column, _ = agg_additions[0]
        else:
            aggregate = ""

        selected_columns = request.GET.getlist("field")[:]
        selected_columns += [
            "countIf({start},{end},1)".format(start=first_interval[0], end=first_interval[1],),
            "countIf({start},{end},2)".format(start=second_interval[0], end=second_interval[1],),
            "count_uniqueIf({start},{end},1,user)".format(
                start=first_interval[0], end=first_interval[1],
            ),
            "count_uniqueIf({start},{end},2,user)".format(
                start=second_interval[0], end=second_interval[1],
            ),
        ]
        if "quantile" in aggregate:
            quantile = aggregate.split("(")[1].strip(")")
            selected_columns.extend(
                [
                    "percentileRange({column},{quantile},{start},{end},1)".format(
                        column=column,
                        quantile=quantile,
                        start=first_interval[0],
                        end=first_interval[1],
                    ),
                    "percentileRange({column},{quantile},{start},{end},2)".format(
                        column=column,
                        quantile=quantile,
                        start=second_interval[0],
                        end=second_interval[1],
                    ),
                ]
            )
        elif "avg" in aggregate:
            selected_columns.extend(
                [
                    "avgRange({column},{start},{end},1)".format(
                        column=column, start=first_interval[0], end=first_interval[1],
                    ),
                    "avgRange({column},{start},{end},2)".format(
                        column=column, start=second_interval[0], end=second_interval[1],
                    ),
                ]
            )
        elif "apdex" in trend_function:
            selected_columns.extend(
                [
                    "apdexRange(300,{start},{end},1)".format(
                        start=first_interval[0], end=first_interval[1],
                    ),
                    "apdexRange(300,{start},{end},2)".format(
                        start=second_interval[0], end=second_interval[1],
                    ),
                ]
            )
        elif "percent_user_misery" in trend_function:
            selected_columns.extend(
                [
                    "percent_user_miseryRange(300,{start},{end},1)".format(
                        start=first_interval[0], end=first_interval[1],
                    ),
                    "percent_user_miseryRange(300,{start},{end},2)".format(
                        start=second_interval[0], end=second_interval[1],
                    ),
                ]
            )
        elif "misery" in trend_function:
            selected_columns.extend(
                [
                    "user_miseryRange(300,{start},{end},1)".format(
                        start=first_interval[0], end=first_interval[1],
                    ),
                    "user_miseryRange(300,{start},{end},2)".format(
                        start=second_interval[0], end=second_interval[1],
                    ),
                ]
            )
        with self.handle_query_errors():
            results = discover.query(
                orderby=request.GET.get(
                    "orderby", ["divide_aggregateRange_2_aggregateRange_1", "transaction"]
                ),
                referrer="api.trends.get_percentage_change",
                selected_columns=selected_columns
                + [
                    "divide(aggregateRange_2,aggregateRange_1)",
                    "minus(aggregateRange_2,aggregateRange_1)",
                    "divide(count_2,count_1)",
                    "divide(count_unique_2,count_unique_1)",
                ],
                query="event.type:transaction " + request.GET.get("query"),
                params=params,
                limit=50,
                auto_fields=True,
                use_aggregate_conditions=True,
                trend_function=True,
                first_interval=first_interval,
                second_interval=second_interval,
            )

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
