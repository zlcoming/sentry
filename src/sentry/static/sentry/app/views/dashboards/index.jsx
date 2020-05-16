import React from 'react';

import {PageContent, PageHeader} from 'sentry/styles/organization';
import {t} from 'sentry/locale';
import Feature from 'sentry/components/acl/feature';
import PageHeading from 'sentry/components/pageHeading';
import LightWeightNoProjectMessage from 'sentry/components/lightWeightNoProjectMessage';
import GlobalSelectionHeader from 'sentry/components/organizations/globalSelectionHeader';
import SentryTypes from 'sentry/sentryTypes';
import withOrganization from 'sentry/utils/withOrganization';

class Dashboards extends React.Component {
  static propTypes = {
    organization: SentryTypes.Organization,
  };

  render() {
    const {organization, children} = this.props;

    return (
      <Feature
        features={['discover', 'discover-query']}
        renderDisabled
        requireAll={false}
      >
        <GlobalSelectionHeader showEnvironmentSelector={false}>
          <PageContent>
            <LightWeightNoProjectMessage organization={organization}>
              <PageHeader>
                <PageHeading withMargins>{t('Dashboards')}</PageHeading>
              </PageHeader>

              {children}
            </LightWeightNoProjectMessage>
          </PageContent>
        </GlobalSelectionHeader>
      </Feature>
    );
  }
}
export default withOrganization(Dashboards);
