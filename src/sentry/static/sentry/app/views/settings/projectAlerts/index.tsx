import {RouteComponentProps} from 'react-router/lib/Router';
import React from 'react';

import {Organization} from 'sentry/types';
import Access from 'sentry/components/acl/access';
import Feature from 'sentry/components/acl/feature';

type Props = {
  organization: Organization;
  children: React.ReactNode;
} & RouteComponentProps<{organizationId: string; projectId: string}, {}>;

const ProjectAlerts = ({children, organization}: Props) => (
  <Access organization={organization} access={['project:write']}>
    {({hasAccess}) => (
      <Feature organization={organization} features={['incidents']}>
        {({hasFeature: hasMetricAlerts}) => (
          <React.Fragment>
            {React.isValidElement(children) &&
              React.cloneElement(children, {
                organization,
                canEditRule: hasAccess,
                hasMetricAlerts,
              })}
          </React.Fragment>
        )}
      </Feature>
    )}
  </Access>
);

export default ProjectAlerts;
