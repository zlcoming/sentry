import React from 'react';
import omit from 'lodash/omit';

import InputField from 'sentry/views/settings/components/forms/inputField';
import Textarea from 'sentry/views/settings/components/forms/controls/textarea';

type Props = Omit<InputField['props'], 'field'>;

export default function TextareaField(props: Props) {
  return (
    <InputField
      {...props}
      field={fieldProps => <Textarea {...omit(fieldProps, ['onKeyDown', 'children'])} />}
    />
  );
}
