import React from 'react';

import {t} from 'app/locale';
import AlertLink from 'app/components/alertLink';

type Props = {
  hasHealthData: boolean;
  platform: string;
};

const UpdateSdk = ({hasHealthData, platform}: Props) => {
  if (
    hasHealthData ||
    !['cocoa-objc', 'cocoa-swift', 'java-android'].includes(platform)
  ) {
    return null;
  }

  return (
    <AlertLink
      href="https://docs.sentry.io/workflow/releases/health/#getting-started"
      openInNewTab
      priority="info"
    >
      {t('Update your SDK to see more release data.')}
    </AlertLink>
  );
};

export default UpdateSdk;
