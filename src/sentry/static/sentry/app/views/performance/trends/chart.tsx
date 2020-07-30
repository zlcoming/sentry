import React from 'react';
import {withRouter} from 'react-router';
import {WithRouterProps} from 'react-router/lib/withRouter';

import TransparentLoadingMask from 'app/components/charts/transparentLoadingMask';
import TransitionChart from 'app/components/charts/transitionChart';
import EventsRequest from 'app/components/charts/eventsRequest';
import ReleaseSeries from 'app/components/charts/releaseSeries';
import getDynamicText from 'app/utils/getDynamicText';
import {getUtcToLocalDateObject} from 'app/utils/dates';
import {decodeScalar} from 'app/utils/queryString';
import withApi from 'app/utils/withApi';
import {Client} from 'app/api';
import EventView from 'app/utils/discover/eventView';
import {OrganizationSummary} from 'app/types';
import QuestionTooltip from 'app/components/questionTooltip';
import LineChart from 'app/components/charts/lineChart';
import {t} from 'app/locale';
import ChartZoom from 'app/components/charts/chartZoom';

import {trendToColor, chartIntervalFunction, getCurrentTrendFunction} from './utils';
import {TrendChangeType} from './types';
import {HeaderTitleLegend} from '../styles';

const QUERY_KEYS = [
  'environment',
  'project',
  'query',
  'start',
  'end',
  'statsPeriod',
] as const;

type ViewProps = Pick<EventView, typeof QUERY_KEYS[number]>;

type Props = WithRouterProps &
  ViewProps & {
    api: Client;
    location: Location;
    organization: OrganizationSummary;
    trendChangeType: TrendChangeType;
    transaction?: string;
    isLoading: boolean;
  };

function getChartTitle(trendChangeType: TrendChangeType): string {
  switch (trendChangeType) {
    case TrendChangeType.IMPROVED:
      return t('Most Improved');
    case TrendChangeType.REGRESSION:
      return t('Worst Regressions');
    default:
      throw new Error('No trend type passed');
  }
}

function getChartTooltip(trendChangeType: TrendChangeType): string {
  return t('TODO: ' + trendChangeType);
}

function scopedTransactionQuery(query: string, transaction?: string) {
  return `${query} event.type:transaction transaction:${transaction}`;
}

class Chart extends React.Component<Props> {
  render() {
    const props = this.props;

    const {
      trendChangeType,
      router,
      statsPeriod,
      organization,
      api,
      project,
      environment,
      location,
    } = props;
    const chartTitle = getChartTitle(trendChangeType);
    const tooltip = getChartTooltip(trendChangeType);
    const lineColor = trendToColor[trendChangeType];

    const currentTrendFunction = getCurrentTrendFunction(location);

    const start = props.start ? getUtcToLocalDateObject(props.start) : undefined;

    const end = props.end ? getUtcToLocalDateObject(props.end) : undefined;
    const utc = decodeScalar(router.location.query.utc);
    const datetimeSelection = {
      start: start || null,
      end: end || null,
      period: statsPeriod,
    };

    const query = scopedTransactionQuery(props.query, props.transaction);

    return (
      <React.Fragment>
        <HeaderTitleLegend>
          {chartTitle}
          <QuestionTooltip size="sm" position="top" title={tooltip} />
        </HeaderTitleLegend>
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
              interval={chartIntervalFunction(datetimeSelection)}
              showLoading={false}
              query={query}
              includePrevious={false}
              yAxis={[currentTrendFunction.field]}
            >
              {({results, loading, reloading}) => {
                const series = results
                  ? results
                      .map(values => {
                        return {
                          ...values,
                          color: lineColor,
                          lineStyle: {
                            opacity: 1,
                          },
                        };
                      })
                      .reverse()
                  : [];
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
                          value: (
                            <LineChart
                              {...zoomRenderProps}
                              series={[...series, ...releaseSeries]}
                              seriesOptions={{
                                showSymbol: false,
                              }}
                              tooltip={tooltip}
                              toolBox={{
                                show: false,
                              }}
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

export default withApi(withRouter(Chart));
