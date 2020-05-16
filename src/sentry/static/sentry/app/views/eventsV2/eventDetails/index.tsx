import {Params} from 'react-router/lib/Router';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';
import {Location} from 'history';

import {Organization} from 'sentry/types';
import {PageContent} from 'sentry/styles/organization';
import {t} from 'sentry/locale';
import LightWeightNoProjectMessage from 'sentry/components/lightWeightNoProjectMessage';
import SentryDocumentTitle from 'sentry/components/sentryDocumentTitle';
import SentryTypes from 'sentry/sentryTypes';
import withOrganization from 'sentry/utils/withOrganization';
import EventView from 'sentry/utils/discover/eventView';

import EventDetailsContent from './content';

type Props = {
  organization: Organization;
  location: Location;
  params: Params;
};

class EventDetails extends React.Component<Props> {
  static propTypes: any = {
    organization: SentryTypes.Organization.isRequired,
    location: PropTypes.object.isRequired,
  };

  getEventSlug = (): string => {
    const {eventSlug} = this.props.params;

    if (typeof eventSlug === 'string') {
      return eventSlug.trim();
    }

    return '';
  };

  getEventView = (): EventView => {
    const {location} = this.props;

    return EventView.fromLocation(location);
  };

  getDocumentTitle = (name: string | undefined): Array<string> =>
    typeof name === 'string' && String(name).trim().length > 0
      ? [String(name).trim(), t('Discover')]
      : [t('Discover')];

  render() {
    const {organization, location, params} = this.props;
    const eventView = this.getEventView();

    const documentTitle = this.getDocumentTitle(eventView.name).join(' - ');

    return (
      <SentryDocumentTitle title={documentTitle} objSlug={organization.slug}>
        <StyledPageContent>
          <LightWeightNoProjectMessage organization={organization}>
            <EventDetailsContent
              organization={organization}
              location={location}
              params={params}
              eventView={eventView}
              eventSlug={this.getEventSlug()}
            />
          </LightWeightNoProjectMessage>
        </StyledPageContent>
      </SentryDocumentTitle>
    );
  }
}

export default withOrganization(EventDetails);

const StyledPageContent = styled(PageContent)`
  padding: 0;
`;
