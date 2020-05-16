import React from 'react';
import {RouteComponentProps} from 'react-router/lib/Router';

import {Organization, Group} from 'sentry/types';
import Feature from 'sentry/components/acl/feature';
import withOrganization from 'sentry/utils/withOrganization';
import FeatureDisabled from 'sentry/components/acl/featureDisabled';

import GroupEventAttachments from './groupEventAttachments';

type Props = RouteComponentProps<{orgId: string; groupId: string}, {}> & {
  organization: Organization;
  group: Group;
};

const GroupEventAttachmentsContainer = ({organization, group}: Props) => (
  <Feature
    features={['event-attachments']}
    organization={organization}
    renderDisabled={props => <FeatureDisabled {...props} />}
  >
    <GroupEventAttachments projectSlug={group.project.slug} />
  </Feature>
);

export default withOrganization(GroupEventAttachmentsContainer);
