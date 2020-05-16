import React from 'react';

import Button from 'sentry/components/button';
import Feature from 'sentry/components/acl/feature';

type Props = React.PropsWithChildren<{
  className?: string;
}> &
  React.ComponentProps<typeof Button>;

/**
 * Provide a button that turns itself off if the current organization
 * doesn't have access to discover results.
 */
function DiscoverButton({children, ...buttonProps}: Props) {
  return (
    <Feature features={['organizations:discover-basic']}>
      {({hasFeature}) => (
        <Button disabled={!hasFeature} {...buttonProps}>
          {children}
        </Button>
      )}
    </Feature>
  );
}

export default DiscoverButton;
