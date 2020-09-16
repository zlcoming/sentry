import React from 'react';
import {Location} from 'history';
import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';

import {Organization} from 'app/types';
import AsyncComponent from 'app/components/asyncComponent';
import EventView from 'app/utils/discover/eventView';

import {NUM_BUCKETS} from './constants';
import {HistogramData} from './types';

const QUERY_KEYS = [
  'environment',
  'project',
  'query',
  'start',
  'end',
  'statsPeriod',
] as const;

type ChildrenProps = {
  isLoading: boolean;
  errors: string[];
  histogram: Partial<Record<string, HistogramData[]>>;
};

type Props = AsyncComponent['props'] & {
  location: Location;
  organization: Organization;
  eventView: EventView;
  measures: string[];
  // TODO(tonyx): remove the min/max this is just for populating test data
  min: number;
  max: number;
  children: (props: ChildrenProps) => React.ReactNode;
};

type ApiResult = {
  histogram_transaction_duration_15: number;
  count: number;
};

type State = AsyncComponent['state'] & {
  chartData: {data: ApiResult[]} | null;
  zoomError?: boolean;
};

/**
 * This class is a stub for the measurements data. It simply generates some
 * random data for the time being. It should be replaced with queries that
 * retrieve the true data from the backend.
 */
class MeasuresQuery extends AsyncComponent<Props, State> {
  getEndpoints(): ReturnType<AsyncComponent['getEndpoints']> {
    const {organization, location, measures} = this.props;

    return measures.map(name => {
      let orderBy = 'count';

      if (measures.length > 0) {
        orderBy = `histogram_${name.replace('.', '_')}_${NUM_BUCKETS}`;
      }

      const fooSavedQuery = this.props.eventView.toNewQuery();

      const eventView = EventView.fromSavedQuery({
        ...fooSavedQuery,

        id: '',
        name: '',
        version: 2,
        fields: [`histogram(${name},${NUM_BUCKETS})`, 'count()'],
        orderby: orderBy,
        query: `transaction.op:pageload ${fooSavedQuery.query ?? ''}`,
      });
      const apiPayload = eventView.getEventsAPIPayload(location);
      apiPayload.referrer = 'api.performance.latencychart';

      return [name, `/organizations/${organization.slug}/eventsv2/`, {query: apiPayload}];
    });
  }

  componentDidUpdate(prevProps: Props) {
    if (this.shouldRefetchData(prevProps)) {
      this.fetchData();
    }
  }

  shouldRefetchData(prevProps: Props) {
    if (this.state.loading) {
      return false;
    }
    return !isEqual(pick(prevProps, QUERY_KEYS), pick(this.props, QUERY_KEYS));
  }

  getActualHistograms() {
    return this.props.measures.reduce((histogram, measureName) => {
      const measurementHistogram = this.state[measureName];

      const fieldName = `histogram_${measureName.replace('.', '_')}_${NUM_BUCKETS}`;

      if (measurementHistogram) {
        histogram[measureName] = measurementHistogram.data.map(dataPoint => {
          return {
            count: dataPoint.count,
            histogram: dataPoint[fieldName],
          };
        });

        return histogram;
      }

      histogram[measureName] = [];

      return histogram;
    }, {});
  }

  getHistograms(_x) {
    const {measures} = this.props;
    const {min, max} = this.props;

    // console.log('measures', measures);
    // console.log('max', max);
    // console.log('min', min);

    return measures.reduce((histogram, measure) => {
      histogram[measure] = Array(NUM_BUCKETS)
        .fill(null)
        .map((_, i) => ({
          histogram: i * ((max - min) / NUM_BUCKETS),
          count: Math.floor(Math.random() * 100),
        }));
      return histogram;
    }, {});
  }

  render() {
    const {children} = this.props;

    // const histogramResults = null;

    return children({
      isLoading: false,
      errors: [],
      histogram: this.getActualHistograms(),
    });
  }
}

export default MeasuresQuery;
