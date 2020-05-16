import {EChartOption} from 'echarts';

import theme from 'sentry/utils/theme';

export default function YAxis(props: EChartOption.YAxis = {}): EChartOption.YAxis {
  return {
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: theme.gray400,
    },
    splitLine: {
      lineStyle: {
        color: theme.borderLighter,
      },
    },
    ...props,
  };
}
