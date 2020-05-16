import React from 'react';
import {Location} from 'history';
import * as ReactRouter from 'react-router';

import {Organization} from 'sentry/types';
import {Client} from 'sentry/api';
import withApi from 'sentry/utils/withApi';
import {getInterval} from 'sentry/components/charts/utils';
import LoadingPanel from 'sentry/components/charts/loadingPanel';
import QuestionTooltip from 'sentry/components/questionTooltip';
import getDynamicText from 'sentry/utils/getDynamicText';
import {getParams} from 'sentry/components/organizations/globalSelectionHeader/getParams';
import {Panel} from 'sentry/components/panels';
import EventView from 'sentry/utils/discover/eventView';
import EventsRequest from 'sentry/components/charts/eventsRequest';
import {getUtcToLocalDateObject} from 'sentry/utils/dates';
import {IconWarning} from 'sentry/icons';

import {getAxisOptions} from '../data';
import {HeaderContainer, HeaderTitle, ErrorPanel} from '../styles';
import Chart from './chart';
import Footer from './footer';

type Props = {
  api: Client;
  eventView: EventView;
  organization: Organization;
  location: Location;
  router: ReactRouter.InjectedRouter;
  keyTransactions: boolean;
};

class Container extends React.Component<Props> {
  getChartParameters() {
    const {location, organization} = this.props;
    const options = getAxisOptions(organization);
    const left = options.find(opt => opt.value === location.query.left) || options[0];
    const right = options.find(opt => opt.value === location.query.right) || options[1];

    return [left, right];
  }

  render() {
    const {api, organization, location, eventView, router, keyTransactions} = this.props;

    // construct request parameters for fetching chart data
    const globalSelection = eventView.getGlobalSelection();
    const start = globalSelection.datetime.start
      ? getUtcToLocalDateObject(globalSelection.datetime.start)
      : undefined;

    const end = globalSelection.datetime.end
      ? getUtcToLocalDateObject(globalSelection.datetime.end)
      : undefined;

    const {utc} = getParams(location.query);
    const axisOptions = this.getChartParameters();

    return (
      <Panel>
        <EventsRequest
          organization={organization}
          api={api}
          period={globalSelection.datetime.period}
          project={globalSelection.projects}
          environment={globalSelection.environments}
          start={start}
          end={end}
          interval={getInterval(
            {
              start: start || null,
              end: end || null,
              period: globalSelection.datetime.period,
            },
            true
          )}
          showLoading={false}
          query={eventView.getEventsAPIPayload(location).query}
          includePrevious={false}
          yAxis={axisOptions.map(opt => opt.value)}
          keyTransactions={keyTransactions}
        >
          {({loading, reloading, errored, results}) => {
            if (errored) {
              return (
                <ErrorPanel>
                  <IconWarning color="gray500" size="lg" />
                </ErrorPanel>
              );
            }

            return (
              <React.Fragment>
                <HeaderContainer>
                  {axisOptions.map((option, i) => (
                    <div key={`${option.label}:${i}`}>
                      <HeaderTitle>
                        {option.label}
                        <QuestionTooltip
                          position="top"
                          size="sm"
                          title={option.tooltip}
                        />
                      </HeaderTitle>
                    </div>
                  ))}
                </HeaderContainer>
                {results ? (
                  getDynamicText({
                    value: (
                      <Chart
                        data={results}
                        loading={loading || reloading}
                        router={router}
                        statsPeriod={globalSelection.datetime.period}
                        utc={utc === 'true'}
                        projects={globalSelection.projects}
                        environments={globalSelection.environments}
                      />
                    ),
                    fixed: 'apdex and throughput charts',
                  })
                ) : (
                  <LoadingPanel data-test-id="events-request-loading" />
                )}
              </React.Fragment>
            );
          }}
        </EventsRequest>
        <Footer
          api={api}
          leftAxis={axisOptions[0].value}
          rightAxis={axisOptions[1].value}
          organization={organization}
          eventView={eventView}
          location={location}
        />
      </Panel>
    );
  }
}

export default withApi(Container);
