import React from 'react';

import Well from 'app/components/well';

export default {
  title: 'UI/Well',
  component: Well,
};

const Template = args => (
  <Well {...args}>
    <p>Some content in the well</p>
  </Well>
);

// Each story then reuses that template
export const Default = Template.bind({});
Default.args = {
  hasImage: false,
  centered: false,
};

export const HasImage = Template.bind({});
HasImage.args = {
  hasImage: true,
  centered: false,
};

export const Centered = Template.bind({});
Centered.args = {
  hasImage: false,
  centered: true,
};

export const HasImageAndCentered = Template.bind({});
Centered.args = {
  hasImage: true,
  centered: true,
};
