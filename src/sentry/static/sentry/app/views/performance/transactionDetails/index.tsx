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
    return typeof eventSlug === 'string' ? eventSlug.trim() : '';
  };

  render() {
    const {organization, location, params} = this.props;
    const documentTitle = t('Performance Details');

    return (
      <SentryDocumentTitle title={documentTitle} objSlug={organization.slug}>
        <StyledPageContent>
          <LightWeightNoProjectMessage organization={organization}>
            <EventDetailsContent
              organization={organization}
              location={location}
              params={params}
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
