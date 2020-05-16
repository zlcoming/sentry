import React from 'react';
import {Link} from 'react-router';

import SentryTypes from 'sentry/sentryTypes';
import Alert from 'sentry/components/alert';
import GroupList from 'sentry/components/issues//groupList';
import {t} from 'sentry/locale';
import {IconOpen} from 'sentry/icons';

const ReleaseNewEvents = props => {
  const {release} = props;
  const {orgId} = props.params;

  return (
    <div>
      <Alert icon={<IconOpen size="14px" />} type="warning">
        <Link
          to={{
            pathname: `/organizations/${orgId}/issues/`,
            query: {query: `firstRelease:${release.version}`},
          }}
        >
          {t('View new issues seen in this release in the stream')}
        </Link>
      </Alert>
      <GroupList
        orgId={orgId}
        query={'first-release:"' + release.version + '"'}
        canSelectGroups={false}
      />
    </div>
  );
};
ReleaseNewEvents.propTypes = {
  release: SentryTypes.Release,
};

export default ReleaseNewEvents;
