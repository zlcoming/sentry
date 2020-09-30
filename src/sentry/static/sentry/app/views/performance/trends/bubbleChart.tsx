import React from 'react';
import {Location} from 'history';
import styled from '@emotion/styled';
import {withRouter} from 'react-router';
import {WithRouterProps} from 'react-router/lib/withRouter';

import {Organization, Project} from 'app/types';
import {Client} from 'app/api';
import BaseChart from 'app/components/charts/baseChart';
import withApi from 'app/utils/withApi';
import withProjects from 'app/utils/withProjects';
import withOrganization from 'app/utils/withOrganization';
import DiscoverQuery from 'app/utils/discover/discoverQuery';
import {Panel} from 'app/components/panels';
import LoadingIndicator from 'app/components/loadingIndicator';
import theme from 'app/utils/theme';
import space from 'app/styles/space';

import {
  NormalizedProjectTrend,
  ProjectTrendsData,
  TrendChangeType,
  TrendFunctionField,
  TrendView,
} from './types';
import {modifyTrendView, normalizeTrends} from './utils';

type Props = WithRouterProps & {
  api: Client;
  organization: Organization;
  trendChangeType: TrendChangeType;
  previousTrendFunction?: TrendFunctionField;
  trendView: TrendView;
  location: Location;
  projects: Project[];
};

// xaxis, yaxis, size, label
type BubbleData = [number, number, number, string];

function bubbleSeries(events: NormalizedProjectTrend[]) {
  let allCount = 0;
  let minCount = Number.MAX_VALUE;
  let maxCount = -Number.MAX_VALUE;
  let maxChange = 0;

  function adjustPercent(percent: number) {
    return percent > 1 ? percent : -1 * (1 / percent);
  }

  events.forEach(event => {
    minCount = Math.min(event.count, minCount);
    maxCount = Math.max(event.count, maxCount);
    allCount += event.count;

    maxChange = Math.max(
      Math.abs(adjustPercent(event.percentage_aggregate_range_2_aggregate_range_1)),
      maxChange
    );
  });

  const countRange = maxCount - minCount;

  const data: BubbleData[] = events.map(event => {
    const normalizedCount = (event.count - countRange / 2) / countRange; // Normalized across [-1, 1];
    const adjustedPercent = adjustPercent(
      event.percentage_aggregate_range_2_aggregate_range_1
    );
    const normalizedPercent = adjustedPercent / maxChange;
    return [normalizedPercent, normalizedCount, event.count, event.project];
  });

  const MAX_SIZE = 100;
  const MIN_SIZE = 10;

  return [
    {
      name: 'projects',
      nameLocation: 'center',
      data,
      type: 'scatter',
      symbolSize: function(d: BubbleData) {
        return Math.max((MAX_SIZE * d[2]) / allCount, MIN_SIZE);
      },
      emphasis: {
        label: {
          show: true,
          formatter: function(param) {
            return param.data[3];
          },
          position: 'top',
        },
      },
      itemStyle: {
        color: theme.purple500,
      },

      xAxis: {
        min: -1.2,
        max: 1.2,
        name: '% Change',
        show: true,
        type: 'value' as any,
        axisLine: {
          show: true,
          lineStyle: {
            width: 2,
            color: theme.purple300,
          },
          onZero: true,
        },
        splitLine: {
          lineStyle: {
            type: 'solid' as any,
          },
        },
        scale: true,
      },
      yAxis: {
        min: -1.2,
        max: 1.2,
        name: 'Volume',
        show: true,
        type: 'value' as any,
        axisLine: {
          show: true,
          lineStyle: {
            width: 2,
            color: theme.purple300,
          },
          onZero: true,
        },
        splitLine: {
          lineStyle: {
            type: 'solid' as any,
          },
        },
        scale: true,
      },
    },
  ];
}

function BubbleChart(props: Props) {
  const {location, trendView, organization, trendChangeType} = props;
  const projectTrendView = trendView.clone();

  modifyTrendView(projectTrendView, location, trendChangeType, true, true);

  return (
    <DiscoverQuery
      eventView={projectTrendView}
      orgSlug={organization.slug}
      location={location}
      trendChangeType={trendChangeType}
      limit={5}
    >
      {({isLoading, tableData}) => {
        const eventsTrendsData = (tableData as unknown) as ProjectTrendsData;
        const trends = eventsTrendsData?.events?.data || [];
        const events = normalizeTrends(trends);

        const series = bubbleSeries(events);

        return (
          <StyledPanel>
            {isLoading ? (
              <EmptyContainer>
                <LoadingIndicator mini />
              </EmptyContainer>
            ) : (
              <BaseChart
                height={400}
                {...props}
                series={series}
                xAxis={series[0].xAxis}
                yAxis={series[0].yAxis}
              />
            )}
          </StyledPanel>
        );
      }}
    </DiscoverQuery>
  );
}

const StyledPanel = styled(Panel)`
  height: 100%;
  padding: ${space(1)} ${space(2)};
  padding-bottom: 0;
`;

const EmptyContainer = styled('div')`
  display: flex;
  justify-content: center;
`;

export default withApi(withProjects(withOrganization(withRouter(BubbleChart))));
