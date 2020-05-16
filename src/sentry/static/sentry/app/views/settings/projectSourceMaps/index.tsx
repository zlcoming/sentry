import React from 'react';
import {RouteComponentProps} from 'react-router/lib/Router';

import {t} from 'sentry/locale';
import {PageContent} from 'sentry/styles/organization';
import Feature from 'sentry/components/acl/feature';
import Alert from 'sentry/components/alert';
import withOrganization from 'sentry/utils/withOrganization';
import {Organization, Project} from 'sentry/types';

type RouteParams = {
  orgId: string;
};

type Props = RouteComponentProps<RouteParams, {}> & {
  organization: Organization;
  project: Project;
};

class ProjectSourceMapsContainer extends React.Component<Props> {
  renderNoAccess() {
    return (
      <PageContent>
        <Alert type="warning">{t("You don't have access to this feature")}</Alert>
      </PageContent>
    );
  }

  render() {
    const {children, project, organization} = this.props;

    return (
      <Feature
        features={['artifacts-in-settings']}
        organization={organization}
        renderDisabled={this.renderNoAccess}
      >
        {React.isValidElement(children) &&
          React.cloneElement(children, {organization, project})}
      </Feature>
    );
  }
}

export default withOrganization(ProjectSourceMapsContainer);
