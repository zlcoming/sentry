import React from 'react';

import {LightWeightOrganization, Organization, Project} from 'sentry/types';
import NoProjectMessage from 'sentry/components/noProjectMessage';
import withProjects from 'sentry/utils/withProjects';

type Props = {
  organization: LightWeightOrganization | Organization;
  projects: Project[];
  loadingProjects: boolean;
};

class LightWeightNoProjectMessage extends React.Component<Props> {
  render() {
    const {organization, projects, loadingProjects} = this.props;
    return (
      <NoProjectMessage
        {...this.props}
        projects={projects}
        loadingProjects={!('projects' in organization) && loadingProjects}
      />
    );
  }
}

export default withProjects(LightWeightNoProjectMessage);
