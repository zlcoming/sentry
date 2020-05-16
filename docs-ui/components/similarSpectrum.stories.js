import React from 'react';
import {withInfo} from '@storybook/addon-info';

import SimilarSpectrum from 'sentry/components/similarSpectrum';

export default {
  title: 'Other/SimilarSpectrum',
};

export const _SimilarSpectrum = withInfo(
  'Similar Spectrum used in Similar Issues'
)(() => <SimilarSpectrum />);

_SimilarSpectrum.story = {
  name: 'SimilarSpectrum',
};
