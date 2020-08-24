import React from 'react';

import Feature from 'app/components/acl/feature';
import {Project, Group} from 'app/types';

import SimilarStackTrace from './similarStackTrace';
import SimilarTraceID from './similarTraceID';

type Props = React.ComponentProps<typeof SimilarTraceID> & {
  project: Project;
  group: Group;
};

const GroupSimilarIssues = ({
  event,
  organization,
  location,
  project,
  group,
  ...props
}: Props) => (
  <React.Fragment>
    <Feature features={['similarity-view']} project={project} organization={organization}>
      <SimilarStackTrace
        project={project}
        location={location}
        group={group}
        query={location.query}
        {...props}
      />
    </Feature>
    <SimilarTraceID event={event} organization={organization} location={location} />
  </React.Fragment>
);

export default GroupSimilarIssues;
