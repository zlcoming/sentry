import React from 'react';

import {t} from 'sentry/locale';
import {IconInfo} from 'sentry/icons';
import Alert from 'sentry/components/alert';

const ComingSoon = () => (
  <Alert type="info" icon={<IconInfo size="md" />}>
    {t('This feature is coming soon!')}
  </Alert>
);

export default ComingSoon;
