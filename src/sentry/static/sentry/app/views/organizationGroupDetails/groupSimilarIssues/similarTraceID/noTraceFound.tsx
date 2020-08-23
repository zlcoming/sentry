import React from 'react';

import {t} from 'app/locale';
import {Panel} from 'app/components/panels';
import EmptyStateWarning from 'app/components/emptyStateWarning';

const NoTraceFound = () => (
  <Panel>
    <EmptyStateWarning small>
      {t(
        'This event has no trace context, therefore it was not possible to fetch similar issues by trace ID.'
      )}
    </EmptyStateWarning>
  </Panel>
);

export default NoTraceFound;
