import React from 'react';
import {Location} from 'history';

import Feature from 'app/components/acl/feature';
import {Project, Organization, Event} from 'app/types';

import SimilarStackTrace from './similarStackTrace';
import SimilarTraceID from './similarTraceID';

type Props = {
  project: Project;
  location: Location;
  organization: Organization;
  event: Event;
};

const GroupSimilarIssues = ({event, organization, location, project}: Props) => (
  <div>
    <SimilarStackTrace project={project} query={location.query.query} />
    <Feature
      features={['discover-basic', 'performance-view']}
      organization={organization}
      requireAll={false}
    >
      <SimilarTraceID event={event} organization={organization} location={location} />
    </Feature>
  </div>
);

export default GroupSimilarIssues;
