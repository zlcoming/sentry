import {Location, LocationDescriptor, Query} from 'history';

import {OrganizationSummary} from 'app/types';
import {decodeScalar} from 'app/utils/queryString';

export function getPerformanceLandingUrl(organization: OrganizationSummary): string {
  return `/organizations/${organization.slug}/performance/`;
}

export function getTransactionSearchQuery(location: Location) {
  return String(decodeScalar(location.query.query) || '').trim();
}

export function getTransactionDetailsUrl(
  organization: OrganizationSummary,
  eventSlug: string,
  transaction: string,
  query: Query
): LocationDescriptor {
  return {
    pathname: `/organizations/${organization.slug}/performance/${eventSlug}/`,
    query: {
      ...query,
      transaction,
    },
  };
}
