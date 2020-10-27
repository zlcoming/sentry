import React from 'react';
import {withRouter} from 'react-router';
import {WithRouterProps} from 'react-router/lib/withRouter';

import TransparentLoadingMask from 'app/components/charts/transparentLoadingMask';
import TransitionChart from 'app/components/charts/transitionChart';
import ReleaseSeries from 'app/components/charts/releaseSeries';
import getDynamicText from 'app/utils/getDynamicText';
import {getUtcToLocalDateObject} from 'app/utils/dates';
import {decodeScalar} from 'app/utils/queryString';
import withApi from 'app/utils/withApi';
import {Client} from 'app/api';
import EventView from 'app/utils/discover/eventView';
import {OrganizationSummary, EventsStatsData} from 'app/types';
import LineChart from 'app/components/charts/lineChart';
import ChartZoom from 'app/components/charts/chartZoom';
import {Series, SeriesDataUnit} from 'app/types/echarts';
import theme from 'app/utils/theme';
import {axisLabelFormatter, tooltipFormatter} from 'app/utils/discover/charts';
import YAxis from 'app/components/charts/components/yAxis';

import {
  getCurrentTrendFunction,
  getIntervalRatio,
  trendToColor,
  getExponentialMovingAverage,
} from './utils';
import {TrendChangeType, TrendsStats, NormalizedTrendsTransaction} from './types';
import {smooth} from './asap';

const QUERY_KEYS = [
  'environment',
  'project',
  'query',
  'start',
  'end',
  'statsPeriod',
] as const;
const AVERAGE_WINDOW = 10;

type ViewProps = Pick<EventView, typeof QUERY_KEYS[number]>;

type Props = WithRouterProps &
  ViewProps & {
    api: Client;
    location: Location;
    organization: OrganizationSummary;
    trendChangeType: TrendChangeType;
    transaction?: NormalizedTrendsTransaction;
    isLoading: boolean;
    statsData: TrendsStats;
  };

function transformEventStats(data: EventsStatsData, seriesName?: string): Series[] {
  return [
    {
      seriesName: seriesName || 'Current',
      data: data.map(([timestamp, countsForTimestamp]) => ({
        name: timestamp * 1000,
        value: countsForTimestamp.reduce((acc, {count}) => acc + count, 0),
      })),
    },
  ];
}

function transformEventStatsASAP(
  data: Series[],
  seriesName?: string,
  resolution?: number
) {
  let minValue = Number.MAX_SAFE_INTEGER;
  let maxValue = 0;
  const currentData = data[0].data;
  const resultData: SeriesDataUnit[] = [];

  const {smoothedData} = smooth(
    currentData.map(d => d.value),
    resolution || 700,
    AVERAGE_WINDOW
  );

  //const size = i < AVERAGE_WINDOW ? i : AVERAGE_WINDOW;

  const currentPoints = currentData.length;
  const smoothedPoints = smoothedData.length;

  const start = parseInt(currentData[0].name as string, 10);

  const ratio = currentPoints / smoothedPoints;

  for (let i = 0; i < smoothedData.length; i++) {
    const value = smoothedData[i];

    const current = parseInt(currentData[i].name as string, 10);
    const diff = current - start;
    const adjusted = Math.floor(diff * ratio) + start;

    resultData.push({
      name: adjusted,
      value,
    });
    minValue = isNaN(value) ? minValue : Math.min(Math.round(value), minValue);
    maxValue = isNaN(value) ? maxValue : Math.max(Math.round(value), maxValue);
  }

  return {
    minValue,
    maxValue,
    ASAPResults: [
      {
        seriesName: 'smoothed ' + seriesName || 'Current',
        data: resultData,
      },
    ],
  };
}

type SmoothedData = {
  smoothedResults: Series[];
  minValue: number;
  maxValue: number;
};

function transformEventStatsSmoothed(data: Series[], seriesName?: string): SmoothedData {
  let minValue = Number.MAX_SAFE_INTEGER;
  let maxValue = 0;
  const currentData = data[0].data;
  const resultData: SeriesDataUnit[] = [];

  const movingAverageData = getExponentialMovingAverage(
    currentData.map(d => d.value),
    AVERAGE_WINDOW
  );

  //const size = i < AVERAGE_WINDOW ? i : AVERAGE_WINDOW;

  for (let i = 0; i < currentData.length; i++) {
    const value = movingAverageData[i];
    resultData.push({
      name: currentData[i].name,
      value,
    });
    minValue = isNaN(value) ? minValue : Math.min(Math.round(value), minValue);
    maxValue = isNaN(value) ? maxValue : Math.max(Math.round(value), maxValue);
  }

  return {
    minValue,
    maxValue,
    smoothedResults: [
      {
        seriesName: 'smoothed ' + seriesName || 'Current',
        data: resultData,
      },
    ],
  };
}

function getLegend(trendFunction: string) {
  const legend = {
    right: 10,
    top: 0,
    itemGap: 12,
    align: 'left',
    textStyle: {
      verticalAlign: 'top',
      fontSize: 11,
      fontFamily: 'Rubik',
    },
    data: [
      {
        name: 'Baseline',
        icon:
          'path://M180 1000 l0 -40 200 0 200 0 0 40 0 40 -200 0 -200 0 0 -40z, M810 1000 l0 -40 200 0 200 0 0 40 0 40 -200 0 -200 0 0 -40zm, M1440 1000 l0 -40 200 0 200 0 0 40 0 40 -200 0 -200 0 0 -40z',
      },
      {
        name: 'Releases',
        icon: 'line',
      },
      {
        name: trendFunction,
        icon: 'line',
      },
    ],
  };
  return legend;
}

function getIntervalLine(
  series: Series[],
  intervalRatio: number,
  transaction?: NormalizedTrendsTransaction
) {
  if (!transaction || !series.length || !series[0].data || !series[0].data.length) {
    return [];
  }

  const seriesStart = parseInt(series[0].data[0].name as string, 0);
  const seriesEnd = parseInt(series[0].data.slice(-1)[0].name as string, 0);

  if (seriesEnd < seriesStart) {
    return [];
  }

  const periodLine = {
    data: [] as any[],
    color: theme.gray700,
    markLine: {
      data: [] as any[],
      label: {} as any,
      lineStyle: {
        normal: {
          color: theme.gray700,
          type: 'dashed',
          width: 1,
        },
      },
      symbol: ['none', 'none'],
      tooltip: {
        show: false,
      },
    },
    seriesName: 'Baseline',
  };

  const periodLineLabel = {
    fontSize: 11,
    show: true,
  };

  const previousPeriod = {
    ...periodLine,
    markLine: {...periodLine.markLine},
    seriesName: 'Baseline',
  };
  const currentPeriod = {
    ...periodLine,
    markLine: {...periodLine.markLine},
    seriesName: 'Baseline',
  };
  const periodDividingLine = {
    ...periodLine,
    markLine: {...periodLine.markLine},
    seriesName: 'Period split',
  };

  const seriesDiff = seriesEnd - seriesStart;
  const seriesLine = seriesDiff * (intervalRatio || 0.5) + seriesStart;

  previousPeriod.markLine.data = [
    [
      {value: 'Past', coord: [seriesStart, transaction.aggregate_range_1]},
      {coord: [seriesLine, transaction.aggregate_range_1]},
    ],
  ];
  currentPeriod.markLine.data = [
    [
      {value: 'Present', coord: [seriesLine, transaction.aggregate_range_2]},
      {coord: [seriesEnd, transaction.aggregate_range_2]},
    ],
  ];
  periodDividingLine.markLine = {
    data: [
      {
        value: 'Previous Period / This Period',
        xAxis: seriesLine,
      },
    ],
    label: {show: false},
    lineStyle: {
      normal: {
        color: theme.gray700,
        type: 'solid',
        width: 2,
      },
    },
    symbol: ['none', 'none'],
    tooltip: {
      show: false,
    },
  };

  previousPeriod.markLine.label = {
    ...periodLineLabel,
    formatter: 'Past',
    position: 'insideStartBottom',
  };
  currentPeriod.markLine.label = {
    ...periodLineLabel,
    formatter: 'Present',
    position: 'insideEndBottom',
  };

  const additionalLineSeries = [previousPeriod, currentPeriod, periodDividingLine];
  return additionalLineSeries;
}

class Chart extends React.Component<Props> {
  chartRef = React.createRef<HTMLDivElement>();

  render() {
    const props = this.props;

    const {
      trendChangeType,
      router,
      statsPeriod,
      project,
      environment,
      transaction,
      statsData,
      isLoading,
      location,
    } = props;
    const lineColor = trendToColor[trendChangeType];

    const events =
      statsData && transaction?.project && transaction?.transaction
        ? statsData[[transaction.project, transaction.transaction].join(',')]
        : undefined;
    const data = events?.['avg(transaction.duration)'].data ?? [];
    const countData = events?.['epm()'].data ?? [];

    const trendFunction = getCurrentTrendFunction(location);
    const results = transformEventStats(data, trendFunction.chartLabel);

    const countResults = transformEventStats(countData, 'epm()');
    results.push(countResults[0]);

    // const {minValue, maxValue, smoothedResults} = transformEventStatsSmoothed(
    //   results,
    //   trendFunction.chartLabel
    // );
    const {ASAPResults, minValue, maxValue} = transformEventStatsASAP(
      results,
      trendFunction.chartLabel,
      this.chartRef.current?.offsetWidth
    );

    const start = props.start ? getUtcToLocalDateObject(props.start) : undefined;

    const end = props.end ? getUtcToLocalDateObject(props.end) : undefined;
    const utc = decodeScalar(router.location.query.utc);

    const intervalRatio = getIntervalRatio(router.location);
    const legend = getLegend(trendFunction.chartLabel);

    const loading = isLoading;
    const reloading = isLoading;
    const axisLineConfig = {
      scale: true,
      splitLine: {
        show: false,
      },
    };

    const chartOptions = {
      tooltip: {
        valueFormatter: (value, seriesName) => {
          return tooltipFormatter(value, seriesName.replace('smoothed ', ''));
        },
      },
      xAxes: [
        {
          gridIndex: 0,
          type: 'time',
          axisLabel: {show: false},
          axisTick: {show: false},
        },
        {
          gridIndex: 1,
          type: 'time',
        },
      ],
      yAxes: [
        {
          min:
            Math.min(
              Math.min(
                minValue,
                transaction?.aggregate_range_1 || Number.MAX_SAFE_INTEGER
              ),
              transaction?.aggregate_range_2 || Number.MAX_SAFE_INTEGER
            ) * 0.8,
          max:
            Math.max(
              Math.max(maxValue, transaction?.aggregate_range_2 || 0),
              transaction?.aggregate_range_1 || 0
            ) * 1.2,
          axisLabel: {
            rich: {
              a: {
                width: '30px',
              },
            },
            color: theme.gray400,
            // p50() coerces the axis to be time based
            formatter: (value: number) => axisLabelFormatter(value, 'p50()'),
          },
          ...axisLineConfig,
        },
        {
          gridIndex: 1,
          minorTick: {
            show: false,
          },
          interval: Number.POSITIVE_INFINITY,
          axisLabel: {
            color: theme.gray400,
            formatter: (value: number) => axisLabelFormatter(value, 'count()'),
          },
          ...axisLineConfig,
        },
      ],
      grid: [
        {
          left: '20px',
          right: '10px',
          top: '40px',
          bottom: '20px',
          height: '170px',
          containLabel: true,
        },
        {
          left: '20px',
          right: '10px',
          top: '225px',
          bottom: '0px',
          height: '55px',
          containLabel: true,
        },
      ],
    };

    return (
      <React.Fragment>
        <ChartZoom
          router={router}
          period={statsPeriod}
          projects={project}
          environments={environment}
        >
          {zoomRenderProps => {
            const smoothedSeries = ASAPResults
              ? ASAPResults.map(values => {
                  return {
                    ...values,
                    color: lineColor.default,
                    lineStyle: {
                      opacity: 1,
                    },
                  };
                }).reverse()
              : [];

            const series = results
              ? results
                  .map(values => {
                    const axisIndex = values.seriesName === 'epm()' ? 1 : 0;
                    const type = values.seriesName === 'epm()' ? 'bar' : 'line';
                    return {
                      ...values,
                      color: lineColor.lighter,
                      lineStyle: {
                        width: 1,
                        opacity: 0.25,
                      },
                      yAxisIndex: axisIndex,
                      xAxisIndex: axisIndex,
                      type,
                    };
                  })
                  .reverse()
              : [];

            const intervalSeries = getIntervalLine(series, intervalRatio, transaction);

            return (
              <ReleaseSeries
                start={start}
                end={end}
                period={statsPeriod}
                utc={utc}
                projects={project}
                environments={environment}
              >
                {({releaseSeries}) => (
                  <TransitionChart loading={loading} reloading={reloading}>
                    <TransparentLoadingMask visible={reloading} />
                    {getDynamicText({
                      value: (
                        <LineChart
                          height={280}
                          ref={this.chartRef}
                          {...zoomRenderProps}
                          {...chartOptions}
                          series={[
                            ...smoothedSeries,
                            ...series,
                            ...releaseSeries,
                            ...intervalSeries,
                          ]}
                          seriesOptions={{
                            showSymbol: false,
                          }}
                          legend={legend}
                          toolBox={{
                            show: false,
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
        </ChartZoom>
      </React.Fragment>
    );
  }
}

export default withApi(withRouter(Chart));
