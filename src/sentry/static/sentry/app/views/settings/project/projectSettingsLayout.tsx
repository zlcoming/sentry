import {RouteComponentProps} from 'react-router/lib/Router';
import React from 'react';

import {Organization} from 'sentry/types';
import ProjectContext from 'sentry/views/projects/projectContext';
import ProjectSettingsNavigation from 'sentry/views/settings/project/projectSettingsNavigation';
import SettingsLayout from 'sentry/views/settings/components/settingsLayout';
import withOrganization from 'sentry/utils/withOrganization';

type Props = {
  organization: Organization;
  children: React.ReactNode;
} & RouteComponentProps<{orgId: string; projectId: string}, {}>;

function ProjectSettingsLayout({params, organization, children, ...props}: Props) {
  const {orgId, projectId} = params;

  return (
    <ProjectContext orgId={orgId} projectId={projectId}>
      <SettingsLayout
        params={params}
        {...props}
        renderNavigation={() => <ProjectSettingsNavigation organization={organization} />}
      >
        {children && React.isValidElement(children)
          ? React.cloneElement(children, {
              organization,
            })
          : children}
      </SettingsLayout>
    </ProjectContext>
  );
}

export default withOrganization(ProjectSettingsLayout);
