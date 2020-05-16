import React from 'react';

import SettingsNavigation from 'sentry/views/settings/components/settingsNavigation';
import getConfiguration from 'sentry/views/settings/project/navigationConfiguration';
import withProject from 'sentry/utils/withProject';
import {Organization, Project} from 'sentry/types';

type Props = {
  organization: Organization;
  project: Project;
};

const ProjectSettingsNavigation = ({organization, project}: Props) => (
  <SettingsNavigation
    navigationObjects={getConfiguration({project, organization})}
    access={new Set(organization.access)}
    features={new Set(organization.features)}
    organization={organization}
    project={project}
  />
);

export default withProject(ProjectSettingsNavigation);
