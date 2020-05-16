import React from 'react';
import {withInfo} from '@storybook/addon-info';

import RepoLabel from 'sentry/components/repoLabel';

export default {
  title: 'RepoLabel',
};

export const Default = withInfo('A badge to use for repo names')(() => {
  return <RepoLabel>prod</RepoLabel>;
});

Default.story = {
  name: 'default',
};
