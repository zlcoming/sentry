import React from 'react';
import {Location} from 'history';
import moment from 'moment-timezone';
import uniqBy from 'lodash/uniqBy';

import EventView from 'app/utils/discover/eventView';
import {ALL_ACCESS_PROJECTS} from 'app/constants/globalSelectionHeader';
import {getTraceDateTimeRange} from 'app/components/events/interfaces/spans/utils';
import DiscoverQuery from 'app/utils/discover/discoverQuery';
import LoadingIndicator from 'app/components/loadingIndicator';
import {Organization, Event} from 'app/types';

import NoTraceFound from './noTraceFound';
import List from './list';

type Props = {
  event: Event;
  organization: Organization;
  location: Location;
  traceID?: string;
};

const Body = ({traceID, event, organization, location}: Props) => {
  if (!traceID) {
    return <NoTraceFound />;
  }

  const orgFeatures = organization.features;
  const orgSlug = organization.slug;

  const getEventView = () => {
    const dateCreated = moment(event.dateCreated).valueOf() / 1000;
    const pointInTime = event.dateReceived
      ? moment(event.dateReceived).valueOf() / 1000
      : dateCreated;

    const {start, end} = getTraceDateTimeRange({
      start: pointInTime,
      end: pointInTime,
    });

    return EventView.fromSavedQuery({
      id: undefined,
      name: `Events with Trace ID ${traceID}`,
      fields: ['title', 'project', 'issue', 'timestamp'],
      orderby: '-timestamp',
      query: `event.type:error  trace:${traceID}`,
      projects: orgFeatures.includes('global-views')
        ? [ALL_ACCESS_PROJECTS]
        : [Number(event.projectID)],
      version: 2,
      start,
      end,
    });
  };

  const eventView = getEventView();

  return (
    <DiscoverQuery location={location} eventView={eventView} orgSlug={orgSlug}>
      {discoverData => {
        if (discoverData.isLoading) {
          return <LoadingIndicator />;
        }

        const stackTraces = uniqBy(discoverData.tableData?.data, 'id').filter(
          evt => evt.id !== event.id
        );

        return <List stackTraces={stackTraces} organization={organization} />;
      }}
    </DiscoverQuery>
  );
};

export default Body;
