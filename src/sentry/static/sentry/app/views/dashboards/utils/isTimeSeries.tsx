import {Query} from 'sentry/views/discover/types';

// Consider a query a time series if
export function isTimeSeries(query: Query) {
  return query?.groupby?.includes('time');
}
