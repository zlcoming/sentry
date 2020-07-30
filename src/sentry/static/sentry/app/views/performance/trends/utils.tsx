import React from 'react';
import {Location} from 'history';

import theme from 'app/utils/theme';
import {
  getDiffInMinutes,
  THIRTY_DAYS,
  TWENTY_FOUR_HOURS,
  ONE_HOUR,
  DateTimeObject,
  ONE_WEEK,
  TWO_WEEKS,
} from 'app/components/charts/utils';
import {decodeScalar} from 'app/utils/queryString';
import Duration from 'app/components/duration';

import {TrendFunction, TrendChangeType} from './types';

export const TRENDS_FUNCTIONS: TrendFunction[] = [
  {
    label: 'Duration (p50)',
    field: 'p50()',
  },
  {
    label: 'Average',
    field: 'avg(transaction.duration)',
  },
  {
    label: 'User Misery',
    field: 'user_misery(300)',
  },
  {
    label: 'User Misery (%)',
    field: 'percent_user_misery(300)',
  },
];

/**
 * This function will increase the interval to help smooth trends
 */
export function chartIntervalFunction(dateTimeSelection: DateTimeObject) {
  const diffInMinutes = getDiffInMinutes(dateTimeSelection);
  if (diffInMinutes >= THIRTY_DAYS) {
    return '48h';
  }

  if (diffInMinutes >= TWO_WEEKS) {
    return '24h';
  }

  if (diffInMinutes >= ONE_WEEK) {
    return '12h';
  }

  if (diffInMinutes >= TWENTY_FOUR_HOURS) {
    return '1h';
  }

  if (diffInMinutes <= ONE_HOUR) {
    return '180s';
  }

  return '2m';
}

export const trendToColor = {
  [TrendChangeType.IMPROVED]: theme.green400,
  [TrendChangeType.REGRESSION]: theme.red400,
};

export const trendOffsetQueryKeys = {
  [TrendChangeType.IMPROVED]: 'improvedOffset',
  [TrendChangeType.REGRESSION]: 'regressionOffset',
};

export function getCurrentTrendFunction(location: Location): TrendFunction {
  const trendFunctionField = decodeScalar(location.query.trendFunction);
  const trendFunction = TRENDS_FUNCTIONS.find(({field}) => field === trendFunctionField);
  return trendFunction || TRENDS_FUNCTIONS[0];
}

export function transformDeltaSpread(from: number, to: number) {
  const fromSeconds = from / 1000;
  const toSeconds = to / 1000;
  const fromSubSecond = fromSeconds < 1;
  const toSubSecond = toSeconds < 1;
  return (
    <span>
      <Duration seconds={fromSeconds} fixedDigits={fromSubSecond ? 0 : 1} abbreviation />
      {' → '}
      <Duration seconds={toSeconds} fixedDigits={toSubSecond ? 0 : 1} abbreviation />
    </span>
  );
}

export function transformPercentage(ratio: number) {
  return `${(ratio * 100).toFixed(0)}%`;
}

export function transformDurationDelta(milliseconds: number, trendType: TrendChangeType) {
  const suffix = trendType === TrendChangeType.REGRESSION ? 'slower' : 'faster';

  const seconds = Math.abs(milliseconds) / 1000;

  const isSubSecond = seconds < 1;
  return (
    <span>
      <Duration seconds={seconds} fixedDigits={isSubSecond ? 0 : 1} abbreviation />{' '}
      {suffix}
    </span>
  );
}
