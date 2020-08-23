import React from 'react';
import {Location} from 'history';

import Feature from 'app/components/acl/feature';
import {Project, Organization, Group, Event} from 'app/types';

import SimilarStackTrace from './similarStackTrace';
import SimilarTraceID from './similarTraceID';

type Props = {
  project: Project;
  location: Location;
  organization: Organization;
  group: Group;
  event: Event;
};

const GroupSimilarIssues = ({event, organization, location, ...props}: Props) => (
  <div>
    <Feature features={['similarity-view']}>
      <SimilarStackTrace
        event={event}
        organization={organization}
        location={location}
        {...props}
      />
    </Feature>
    <Feature features={['discover-basic', 'performance-view']} requireAll={false}>
      <SimilarTraceID event={event} organization={organization} location={location} />
    </Feature>
  </div>
);

export default GroupSimilarIssues;
