import React from 'react';

import {Project, AvatarProject} from 'app/types';

import Projects, {RenderProps as ProjectRenderProps} from './projects';

type ProjectPlaceholderId = Pick<Project, 'id'>;
type RenderProps = Omit<ProjectRenderProps, 'projects'> & {
  projects: Project[] | ProjectPlaceholderId[];
};
type RenderFunc = (props: RenderProps) => React.ReactNode;

type Props = Omit<React.ComponentProps<typeof Projects>, 'slugs'> & {
  /**
   * List of ids to look for summaries for, this can be from `props.projects`,
   * otherwise fetch from API
   */
  ids: string[];
  children: RenderFunc;
};

const ProjectsFromId: React.FC<Props> = props => {
  return <Projects {...props} />;
};

export default ProjectsFromId;
