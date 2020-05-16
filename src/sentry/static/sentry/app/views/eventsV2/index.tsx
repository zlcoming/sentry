import React from 'react';

import {t} from 'sentry/locale';
import {Organization} from 'sentry/types';
import {PageContent} from 'sentry/styles/organization';
import SentryTypes from 'sentry/sentryTypes';
import Feature from 'sentry/components/acl/feature';
import Alert from 'sentry/components/alert';
import withOrganization from 'sentry/utils/withOrganization';

type Props = {
  organization: Organization;
};

class DiscoverContainer extends React.Component<Props> {
  static propTypes = {
    organization: SentryTypes.Organization.isRequired,
  };

  renderNoAccess() {
    return (
      <PageContent>
        <Alert type="warning">{t("You don't have access to this feature")}</Alert>
      </PageContent>
    );
  }

  render() {
    const {organization, children} = this.props;

    return (
      <Feature
        features={['discover-basic']}
        organization={organization}
        hookName="feature-disabled:discover2-page"
        renderDisabled={this.renderNoAccess}
      >
        {children}
      </Feature>
    );
  }
}

export default withOrganization(DiscoverContainer);
