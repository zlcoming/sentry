import PropTypes from 'prop-types';
import React from 'react';

import {defined} from 'sentry/utils';
import BooleanField from 'sentry/components/forms/booleanField';
import EmailField from 'sentry/components/forms/emailField';
import NumberField from 'sentry/components/forms/numberField';
import PasswordField from 'sentry/components/forms/passwordField';
import RangeField from 'sentry/components/forms/rangeField';
import SelectAsyncField from 'sentry/components/forms/selectAsyncField';
import SelectField from 'sentry/components/forms/selectField';
import SelectCreatableField from 'sentry/components/forms/selectCreatableField';
import TextField from 'sentry/components/forms/textField';
import TextareaField from 'sentry/components/forms/textareaField';

export default class GenericField extends React.Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
    formData: PropTypes.object,
    formErrors: PropTypes.object,
    formState: PropTypes.string.isRequired,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    formData: {},
    formErrors: {},
  };

  render() {
    const config = this.props.config;
    const required = defined(config.required) ? config.required : true;
    const props = {
      ...config,
      value: this.props.formData[config.name],
      onChange: this.props.onChange,
      label: config.label + (required ? '*' : ''),
      placeholder: config.placeholder,
      required,
      name: config.name,
      error: (this.props.formErrors || {})[config.name],
      defaultValue: config.default,
      disabled: config.readonly,
      key: config.name,
      formState: this.props.formState,
      help:
        defined(config.help) && config.help !== '' ? (
          <span dangerouslySetInnerHTML={{__html: config.help}} />
        ) : null,
    };

    switch (config.type) {
      case 'secret':
        return <PasswordField {...props} />;
      case 'range':
        return <RangeField {...props} />;
      case 'bool':
        return <BooleanField {...props} />;
      case 'email':
        return <EmailField {...props} />;
      case 'string':
      case 'text':
      case 'url':
        if (props.choices) {
          return <SelectCreatableField deprecatedSelectControl {...props} />;
        }
        return <TextField {...props} />;
      case 'number':
        return <NumberField {...props} />;
      case 'textarea':
        return <TextareaField {...props} />;
      case 'choice':
      case 'select':
        // the chrome required tip winds up in weird places
        // for select elements, so just make it look like
        // it's required (with *) and rely on server validation
        delete props.required;
        if (props.has_autocomplete) {
          return <SelectAsyncField deprecatedSelectControl {...props} />;
        }
        return <SelectField deprecatedSelectControl {...props} />;
      default:
        return null;
    }
  }
}
