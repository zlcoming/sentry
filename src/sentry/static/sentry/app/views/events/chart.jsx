import React from 'react';

import SentryTypes from 'sentry/sentryTypes';
import EventsChart from 'sentry/components/charts/eventsChart';
import withApi from 'sentry/utils/withApi';
import withGlobalSelection from 'sentry/utils/withGlobalSelection';

const Chart = withGlobalSelection(
  withApi(
    class EventsChartWithParams extends React.Component {
      static propTypes = {
        selection: SentryTypes.GlobalSelection,
      };

      render() {
        const {selection, ...props} = this.props;
        const {datetime, projects, environments} = selection;

        return (
          <EventsChart
            {...datetime}
            projects={projects || []}
            environments={environments || []}
            {...props}
          />
        );
      }
    }
  )
);

export default Chart;
