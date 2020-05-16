import React from 'react';
import {withInfo} from '@storybook/addon-info';

import Toolbar from 'sentry/components/toolbar';
import ToolbarHeader from 'sentry/components/toolbarHeader';
import SpreadLayout from 'sentry/components/spreadLayout';

export default {
  title: 'Deprecated/Toolbar',
};

export const Default = withInfo(
  'Toolbar that is used on top of a box. i.e. Issue Stream. Not responsible for any layout/padding.'
)(() => (
  <Toolbar>
    <SpreadLayout>
      <ToolbarHeader>Left</ToolbarHeader>
      <ToolbarHeader>Right</ToolbarHeader>
    </SpreadLayout>
  </Toolbar>
));

Default.story = {
  name: 'default',
};
