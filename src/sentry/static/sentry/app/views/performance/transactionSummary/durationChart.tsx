import React from 'react';
import {browserHistory} from 'react-router';
import * as ReactRouter from 'react-router';
import {Location} from 'history';

import {OrganizationSummary} from 'app/types';
import {Client} from 'app/api';
import {t} from 'app/locale';
import AreaChart from 'app/components/charts/areaChart';
import LineChart from 'app/components/charts/lineChart';
import ChartZoom from 'app/components/charts/chartZoom';
import ErrorPanel from 'app/components/charts/errorPanel';
import TransparentLoadingMask from 'app/components/charts/transparentLoadingMask';
import TransitionChart from 'app/components/charts/transitionChart';
import EventsRequest from 'app/components/charts/eventsRequest';
import ReleaseSeries from 'app/components/charts/releaseSeries';
import QuestionTooltip from 'app/components/questionTooltip';
import {getInterval} from 'app/components/charts/utils';
import {IconWarning} from 'app/icons';
import {getUtcToLocalDateObject} from 'app/utils/dates';
import EventView from 'app/utils/discover/eventView';
import withApi from 'app/utils/withApi';
import {decodeScalar} from 'app/utils/queryString';
import theme from 'app/utils/theme';
import {getDuration} from 'app/utils/formatters';
import getDynamicText from 'app/utils/getDynamicText';

import {HeaderTitleLegend} from '../styles';
import {TrendsTransaction} from '../trends';

const QUERY_KEYS = [
  'environment',
  'project',
  'query',
  'start',
  'end',
  'statsPeriod',
] as const;

type ViewProps = Pick<EventView, typeof QUERY_KEYS[number]>;

type Props = ReactRouter.WithRouterProps &
  ViewProps & {
    api: Client;
    location: Location;
    organization: OrganizationSummary;
    chartTitle?: string;
    titleTooltipContent?: string;
    overrideYAxis?: string[];
    intervalFunction?: (dateTimeSelection: any) => string;
    useLineChart?: boolean;
    scopedTransaction?: TrendsTransaction;
    hideTitle?: boolean;
    forceLineColor?: string;
    additionalSeries?: any;
    intervalRatio?: number;
  };

const YAXIS_VALUES = ['p50()', 'p75()', 'p95()', 'p99()', 'p100()'];

function scopedTransactionQuery(query: string, scopedTransaction: TrendsTransaction) {
  return `${query} event.type:transaction transaction:${scopedTransaction.transaction}`;
}

/**
 * Fetch and render a stacked area chart that shows duration
 * percentiles over the past 7 days
 */
class DurationChart extends React.Component<Props> {
  handleLegendSelectChanged = legendChange => {
    const {location} = this.props;
    const {selected} = legendChange;
    const unselected = Object.keys(selected).filter(key => !selected[key]);

    const to = {
      ...location,
      query: {
        ...location.query,
        unselectedSeries: unselected,
      },
    };
    browserHistory.push(to);
  };

  render() {
    const {
      api,
      project,
      environment,
      location,
      organization,
      query,
      statsPeriod,
      router,
      chartTitle,
      titleTooltipContent,
      overrideYAxis,
      intervalFunction,
      useLineChart,
      scopedTransaction,
      hideTitle,
      forceLineColor,
      intervalRatio,
      additionalSeries: additionalLineSeries,
    } = this.props;

    const unselectedSeries = location.query.unselectedSeries ?? [];
    const unselectedMetrics = Array.isArray(unselectedSeries)
      ? unselectedSeries
      : [unselectedSeries];
    const seriesSelection = unselectedMetrics.reduce((selection, metric) => {
      selection[metric] = false;
      return selection;
    }, {});

    const start = this.props.start
      ? getUtcToLocalDateObject(this.props.start)
      : undefined;

    const end = this.props.end ? getUtcToLocalDateObject(this.props.end) : undefined;
    const utc = decodeScalar(router.location.query.utc);

    const legend = {
      right: 10,
      top: 0,
      icon: 'circle',
      itemHeight: 8,
      itemWidth: 8,
      itemGap: 12,
      align: 'left',
      textStyle: {
        verticalAlign: 'top',
        fontSize: 11,
        fontFamily: 'Rubik',
      },
      selected: seriesSelection,
    };

    const tooltip = {
      valueFormatter(value: number) {
        return getDuration(value / 1000, 2);
      },
    };

    const datetimeSelection = {
      start: start || null,
      end: end || null,
      period: statsPeriod,
    };

    const _query = scopedTransaction
      ? scopedTransactionQuery(query, scopedTransaction)
      : query;

    return (
      <React.Fragment>
        {!hideTitle && (
          <HeaderTitleLegend>
            {t(chartTitle || 'Duration Breakdown')}
            <QuestionTooltip
              size="sm"
              position="top"
              title={t(
                titleTooltipContent ||
                  `Duration Breakdown reflects transaction durations by percentile over time.`
              )}
            />
          </HeaderTitleLegend>
        )}
        <ChartZoom
          router={router}
          period={statsPeriod}
          projects={project}
          environments={environment}
        >
          {zoomRenderProps => (
            <EventsRequest
              api={api}
              organization={organization}
              period={statsPeriod}
              project={[...project]}
              environment={[...environment]}
              start={start}
              end={end}
              interval={
                intervalFunction
                  ? intervalFunction(datetimeSelection)
                  : getInterval(datetimeSelection, true)
              }
              showLoading={false}
              query={_query}
              includePrevious={false}
              yAxis={overrideYAxis || YAXIS_VALUES}
            >
              {({results, errored, loading, reloading}) => {
                if (errored) {
                  return (
                    <ErrorPanel>
                      <IconWarning color="gray500" size="lg" />
                    </ErrorPanel>
                  );
                }
                const colors =
                  (results && theme.charts.getColorPalette(results.length - 2)) || [];

                // Create a list of series based on the order of the fields,
                // We need to flip it at the end to ensure the series stack right.
                const series = results
                  ? results
                      .map((values, i: number) => {
                        return {
                          ...values,
                          color: forceLineColor || colors[i],
                          lineStyle: {
                            opacity: useLineChart ? 1 : 0,
                          },
                        };
                      })
                      .reverse()
                  : [];

                // TODO: Replace all of this
                if (series[0]) {
                  const seriesStart = parseInt(series[0].data[0].name as string, 0);
                  const seriesEnd = parseInt(
                    series[0].data.slice(-1)[0].name as string,
                    0
                  );

                  if (additionalLineSeries && seriesEnd > seriesStart) {
                    const seriesDiff = seriesEnd - seriesStart;
                    const seriesLine = seriesDiff * (intervalRatio || 0.5) + seriesStart;
                    additionalLineSeries[0].markLine.data = [
                      {
                        value: 'Comparison line',
                        xAxis: seriesLine,
                      },
                    ];
                  }
                }

                // Stack the toolbox under the legend.
                // so all series names are clickable.
                zoomRenderProps.toolBox.z = -1;

                return (
                  <ReleaseSeries
                    start={start}
                    end={end}
                    period={statsPeriod}
                    utc={utc}
                    projects={project}
                  >
                    {({releaseSeries}) => (
                      <TransitionChart loading={loading} reloading={reloading}>
                        <TransparentLoadingMask visible={reloading} />
                        {getDynamicText({
                          value: useLineChart ? (
                            <LineChart
                              {...zoomRenderProps} // TODO: Removed legend for now to avoid issues with no timeseries being displayed
                              onLegendSelectChanged={this.handleLegendSelectChanged}
                              series={[
                                ...series,
                                ...releaseSeries,
                                ...(additionalLineSeries || []),
                              ]}
                              seriesOptions={{
                                showSymbol: false,
                              }}
                              tooltip={tooltip}
                              toolBox={{
                                show: false, // TODO: Replace with check for trends or move out into separate chart just for trends
                              }}
                              grid={{
                                left: '10px',
                                right: '10px',
                                top: hideTitle ? '12px' : '40px',
                                bottom: '0px',
                              }}
                            />
                          ) : (
                            <AreaChart
                              {...zoomRenderProps}
                              legend={legend}
                              onLegendSelectChanged={this.handleLegendSelectChanged}
                              series={[...series, ...releaseSeries]}
                              seriesOptions={{
                                showSymbol: false,
                              }}
                              tooltip={tooltip}
                              grid={{
                                left: '10px',
                                right: '10px',
                                top: '40px',
                                bottom: '0px',
                              }}
                            />
                          ),
                          fixed: 'Duration Chart',
                        })}
                      </TransitionChart>
                    )}
                  </ReleaseSeries>
                );
              }}
            </EventsRequest>
          )}
        </ChartZoom>
      </React.Fragment>
    );
  }
}

export default withApi(ReactRouter.withRouter(DurationChart));
