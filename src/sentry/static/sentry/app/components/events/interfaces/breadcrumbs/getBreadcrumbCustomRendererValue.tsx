import React from 'react';

import {Meta} from 'sentry/types';
import AnnotatedText from 'sentry/components/events/meta/annotatedText';

type Props = {
  value: React.ReactNode;
  meta?: Meta;
};

function getBreadcrumbCustomRendererValue({value, meta}: Props) {
  return <AnnotatedText value={value} meta={meta} />;
}

export default getBreadcrumbCustomRendererValue;
