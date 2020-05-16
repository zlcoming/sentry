import React from 'react';
import * as ReactRouter from 'react-router';

import ChartZoom from 'sentry/components/charts/chartZoom';
import {IconWarning} from 'sentry/icons';
import {GlobalSelection} from 'sentry/types';
import TransitionChart from 'sentry/components/charts/transitionChart';
import TransparentLoadingMask from 'sentry/components/charts/transparentLoadingMask';
import ErrorPanel from 'sentry/components/charts/errorPanel';

import HealthChart from './healthChart';
import {YAxis} from './releaseChartControls';
import {ReleaseStatsRequestRenderProps} from '../releaseStatsRequest';

type Props = Omit<
  ReleaseStatsRequestRenderProps,
  'crashFreeTimeBreakdown' | 'chartSummary'
> & {
  selection: GlobalSelection;
  yAxis: YAxis;
  router: ReactRouter.InjectedRouter;
};

const ReleaseChartContainer = ({
  loading,
  errored,
  reloading,
  chartData,
  selection,
  yAxis,
  router,
}: Props) => {
  const {datetime} = selection;
  const {utc, period, start, end} = datetime;

  return (
    <React.Fragment>
      <ChartZoom router={router} period={period} utc={utc} start={start} end={end}>
        {zoomRenderProps => {
          if (errored) {
            return (
              <ErrorPanel>
                <IconWarning color="gray500" size="lg" />
              </ErrorPanel>
            );
          }

          return (
            <TransitionChart loading={loading} reloading={reloading}>
              <TransparentLoadingMask visible={reloading} />
              <HealthChart
                utc={utc}
                timeseriesData={chartData}
                zoomRenderProps={zoomRenderProps}
                reloading={reloading}
                yAxis={yAxis}
              />
            </TransitionChart>
          );
        }}
      </ChartZoom>
    </React.Fragment>
  );
};

export default ReleaseChartContainer;
