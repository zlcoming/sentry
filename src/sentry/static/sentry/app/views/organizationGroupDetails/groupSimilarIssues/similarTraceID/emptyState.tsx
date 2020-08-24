import React from 'react';

import {Panel, PanelBody} from 'app/components/panels';
import EmptyStateWarning from 'app/components/emptyStateWarning';

type Props = {
  message: string;
};

const EmptyState = ({message}: Props) => (
  <Panel>
    <PanelBody>
      <EmptyStateWarning small withIcon={false}>
        {message}
      </EmptyStateWarning>
    </PanelBody>
  </Panel>
);

export default EmptyState;
