import React from 'react';

import Feature from 'sentry/components/acl/feature';
import BreadcrumbsInterface from 'sentry/components/events/interfaces/breadcrumbs/breadcrumbs';
import Breadcrumbs from 'sentry/components/events/interfaces/breadcrumbsV2';

type Props = React.ComponentProps<typeof Breadcrumbs>;
type BreadcrumbsInterfaceProps = React.ComponentProps<typeof BreadcrumbsInterface>;

const EventEntriesBreadcrumbs = (props: Props) => (
  <Feature features={['breadcrumbs-v2']}>
    {({hasFeature}) =>
      hasFeature ? (
        <Breadcrumbs {...props} />
      ) : (
        <BreadcrumbsInterface {...(props as BreadcrumbsInterfaceProps)} />
      )
    }
  </Feature>
);

export default EventEntriesBreadcrumbs;
