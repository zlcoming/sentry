import React from 'react';

import SelectControl from 'sentry/components/forms/selectControl';

export default React.forwardRef(function MultiSelectControl(props, ref) {
  return <SelectControl forwardedRef={ref} {...props} multiple />;
});
