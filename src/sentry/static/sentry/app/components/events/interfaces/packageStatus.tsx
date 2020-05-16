import React from 'react';
import styled from '@emotion/styled';

import {IconCircle, IconCheckmark, IconFlag} from 'sentry/icons';
import Tooltip from 'sentry/components/tooltip';
import space from 'sentry/styles/space';

type Props = {
  status: 'error' | 'success' | 'empty';
  tooltip?: string;
};

class PackageStatus extends React.Component<Props> {
  getIcon(status: Props['status']): React.ReactNode {
    switch (status) {
      case 'success':
        return <IconCheckmark isCircled color="green500" />;
      case 'empty':
        return <IconCircle />;
      case 'error':
      default:
        return <IconFlag color="red400" />;
    }
  }

  render() {
    const {status, tooltip} = this.props;

    const icon = this.getIcon(status);

    if (status === 'empty') {
      return null;
    }

    return (
      <Tooltip title={tooltip} disabled={!(tooltip && tooltip.length)}>
        <PackageStatusIcon>{icon}</PackageStatusIcon>
      </Tooltip>
    );
  }
}

export const PackageStatusIcon = styled('span')`
  margin-left: ${space(0.5)};
  opacity: 0;
`;

export default PackageStatus;
