import React from 'react';

import {OrganizationSummary} from 'sentry/types';
import {explodeSlug} from 'sentry/utils';
import BaseAvatar from 'sentry/components/avatar/baseAvatar';
import SentryTypes from 'sentry/sentryTypes';

type Props = {
  organization?: OrganizationSummary;
} & Omit<BaseAvatar['props'], 'uploadPath' | 'uploadId'>;

class OrganizationAvatar extends React.Component<Props> {
  static propTypes = {
    organization: SentryTypes.Organization.isRequired,
    ...BaseAvatar.propTypes,
  };

  render() {
    const {organization, ...props} = this.props;
    if (!organization) {
      return null;
    }
    const slug = (organization && organization.slug) || '';
    const title = explodeSlug(slug);

    return (
      <BaseAvatar
        {...props}
        type={(organization.avatar && organization.avatar.avatarType) || 'letter_avatar'}
        uploadPath="organization-avatar"
        uploadId={organization.avatar && organization.avatar.avatarUuid}
        letterId={slug}
        tooltip={slug}
        title={title}
      />
    );
  }
}
export default OrganizationAvatar;
