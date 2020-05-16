import React from 'react';
import {withInfo} from '@storybook/addon-info';

import ExternalLink from 'sentry/components/links/externalLink';

export default {
  title: 'UI/Links/ExternalLink',
};

export const Default = withInfo(
  'A normal anchor that opens URL in a new tab accounting for \'target="_blank"\' vulns'
)(() => <ExternalLink href="https://www.sentry.io">Sentry</ExternalLink>);

Default.story = {
  name: 'default',
};
