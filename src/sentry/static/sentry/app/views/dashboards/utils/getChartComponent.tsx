import AreaChart from 'sentry/components/charts/areaChart';
import BarChart from 'sentry/components/charts/barChart';
import LineChart from 'sentry/components/charts/lineChart';
import PercentageAreaChart from 'sentry/components/charts/percentageAreaChart';
import PercentageTableChart from 'sentry/components/charts/percentageTableChart';
import PieChart from 'sentry/components/charts/pieChart';
import StackedAreaChart from 'sentry/components/charts/stackedAreaChart';
import WorldMapChart from 'sentry/components/charts/worldMapChart';

import {WIDGET_DISPLAY} from '../constants';

const CHART_MAP: Record<WIDGET_DISPLAY, React.Component> = {
  [WIDGET_DISPLAY.LINE_CHART]: LineChart,
  [WIDGET_DISPLAY.AREA_CHART]: AreaChart,
  [WIDGET_DISPLAY.STACKED_AREA_CHART]: StackedAreaChart,
  [WIDGET_DISPLAY.BAR_CHART]: BarChart,
  [WIDGET_DISPLAY.PIE_CHART]: PieChart,
  [WIDGET_DISPLAY.WORLD_MAP]: WorldMapChart,
  [WIDGET_DISPLAY.TABLE]: PercentageTableChart,
  [WIDGET_DISPLAY.PERCENTAGE_AREA_CHART]: PercentageAreaChart,
};

export function getChartComponent({type}: {type: WIDGET_DISPLAY}) {
  return CHART_MAP[type];
}
