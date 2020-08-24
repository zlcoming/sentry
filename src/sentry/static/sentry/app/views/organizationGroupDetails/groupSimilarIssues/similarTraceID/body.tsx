import React from 'react';
import {Location} from 'history';
import pick from 'lodash/pick';

import {t} from 'app/locale';
import {DEFAULT_RELATIVE_PERIODS} from 'app/constants';
import {URL_PARAM} from 'app/constants/globalSelectionHeader';
import {Organization, Event} from 'app/types';
import {stringifyQueryObject, QueryResults} from 'app/utils/tokenizeSearch';
import GroupList from 'app/components/issues/groupList';

import EmptyState from './emptyState';

type Props = {
  event: Event;
  organization: Organization;
  location: Location;
  traceID?: string;
};

const Body = ({traceID, organization, location}: Props) => {
  if (!traceID) {
    return (
      <EmptyState
        message={t(
          'This event has no trace context, therefore it was not possible to fetch similar issues by trace ID.'
        )}
      />
    );
  }

  const orgSlug = organization.slug;

  const getIssuesEndpoint = () => {
    const queryParams = {
      sort: 'new',
      ...pick(location.query, [...Object.values(URL_PARAM), 'cursor']),
    };
    return {
      path: `/organizations/${orgSlug}/issues/`,
      queryParams: {
        ...queryParams,
        query: stringifyQueryObject(new QueryResults([`trace:${traceID}`])),
      },
    };
  };

  const renderEmptyMessage = () => {
    const {statsPeriod} = location.query;

    const selectedTimePeriod =
      statsPeriod &&
      typeof statsPeriod === 'string' &&
      DEFAULT_RELATIVE_PERIODS[statsPeriod];
    const displayedPeriod = selectedTimePeriod
      ? selectedTimePeriod.toLowerCase()
      : t('given timeframe');

    return (
      <EmptyState
        message={t(
          'No issues with the same trace ID have been found for the %s.',
          displayedPeriod
        )}
      />
    );
  };

  const {path, queryParams} = getIssuesEndpoint();

  return (
    <GroupList
      orgId={orgSlug}
      endpointPath={path}
      queryParams={queryParams}
      query=""
      renderEmptyMessage={renderEmptyMessage}
      canSelectGroups={false}
      withChart={false}
      withPagination={false}
    />
  );
};

export default Body;
