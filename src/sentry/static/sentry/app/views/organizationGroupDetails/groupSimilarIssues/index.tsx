import React from 'react';
import {Location} from 'history';

import Feature from 'app/components/acl/feature';
import {Project, Organization, Event, Group} from 'app/types';

import SimilarStackTrace from './similarStackTrace';
import SimilarTraceID from './similarTraceID';

type Props = {
  project: Project;
  location: Location;
  organization: Organization;
  event: Event;
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
  <div>
    <Feature features={['similarity-view']} project={project} organization={organization}>
      <SimilarStackTrace
        project={project}
        location={location}
        group={group}
        query={location.query}
        {...props}
      />
    </Feature>
    <Feature
      features={['discover-basic', 'performance-view']}
      project={project}
      organization={organization}
      requireAll={false}
    >
      <SimilarTraceID event={event} organization={organization} location={location} />
    </Feature>
  </div>
);

export default GroupSimilarIssues;
