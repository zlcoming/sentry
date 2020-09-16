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

    const selectMeasures = measures.map(name => {
      return `histogram(${name},${NUM_BUCKETS})`;
    });

    let orderBy = 'count';

    if (measures.length > 0) {
      orderBy = `histogram_${measures[0].replace('.', '_')}_50`;
    }

    const eventView = EventView.fromSavedQuery({
      ...this.props.eventView.toNewQuery(),

      id: '',
      name: '',
      version: 2,
      fields: [selectMeasures[0], 'count()'],
      orderby: orderBy,
      query: '',
    });
    const apiPayload = eventView.getEventsAPIPayload(location);
    apiPayload.referrer = 'api.performance.latencychart';

    return [
      [
        'histograms',
        `/organizations/${organization.slug}/eventsv2/`,
        {query: apiPayload},
      ],
    ];
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

    const histogramResults = null;

    return children({
      isLoading: false,
      errors: [],
      histogram: this.getHistograms(histogramResults),
    });
  }
}

export default MeasuresQuery;
