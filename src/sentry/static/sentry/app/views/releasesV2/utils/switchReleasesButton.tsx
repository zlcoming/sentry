import React from 'react';

import {t} from 'sentry/locale';
import Button from 'sentry/components/button';
import {IconReleases} from 'sentry/icons';

import {switchReleasesVersion} from './index';

type Props = {
  orgId: string; // actual id, not slug
  version: '1' | '2';
};

const SwitchReleasesButton = ({orgId, version}: Props) => {
  const switchReleases = () => {
    switchReleasesVersion(version, orgId);
  };

  if (version === '2') {
    return (
      <Button
        priority="primary"
        size="small"
        icon={<IconReleases size="sm" />}
        onClick={switchReleases}
      >
        {t('Go to New Releases')}
      </Button>
    );
  }

  return (
    <div>
      <Button priority="link" size="small" onClick={switchReleases}>
        {t('Go to Legacy Releases')}
      </Button>
    </div>
  );
};

export default SwitchReleasesButton;
