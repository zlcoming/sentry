import React from 'react';

import {t} from 'sentry/locale';
import {PageContent} from 'sentry/styles/organization';
import SentryTypes from 'sentry/sentryTypes';
import Feature from 'sentry/components/acl/feature';
import Alert from 'sentry/components/alert';
import withOrganization from 'sentry/utils/withOrganization';

import ProjectProguard from './projectProguard';

class ProjectProguardContainer extends React.Component<ProjectProguard['props']> {
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
    const {organization} = this.props;

    return (
      <Feature
        features={['android-mappings']}
        organization={organization}
        renderDisabled={this.renderNoAccess}
      >
        <ProjectProguard {...this.props} />
      </Feature>
    );
  }
}

export default withOrganization(ProjectProguardContainer);
