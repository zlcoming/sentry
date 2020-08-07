import PropTypes from 'prop-types';
import React from 'react';
import Modal from 'react-bootstrap/lib/Modal';

import {t} from 'app/locale';
import Button from 'app/components/button';
import InputField from 'app/views/settings/components/forms/inputField';
import ButtonBar from 'app/components/buttonBar';

export default class IssueLabelModal extends React.Component {
  // TODO: Edit label modal
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onCanceled: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    primaryButtonText: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    label: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    }),
  };

  constructor(props) {
    super(props);
    this.state = {
      name: props.label ? props.label.name : '',
      color: props.label ? props.label.color : '',
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      name: nextProps.label ? nextProps.label.name : '',
      color: nextProps.label ? nextProps.label.color : '',
    });
  }

  handleSubmit = () => {
    const {name, color} = this.state;
    const {label} = this.props;

    this.props.onSubmit(name, color, label ? label.id : null);
  };

  handleChange = (name, value) => {
    this.setState({[name]: value});
  };

  render() {
    const {show, onCanceled, primaryButtonText, title} = this.props;
    const {name, color} = this.state;
    return (
      <Modal show={show} animation={false} onHide={onCanceled}>
        <Modal.Header>
          <h4>{title}</h4>
        </Modal.Header>
        <Modal.Body>
          <InputField
            inline={false}
            flexibleControlStateSize
            stacked
            label="Name"
            name="name"
            type="text"
            value={name}
            onChange={val => this.handleChange('name', val)}
            required
            placeholder={t('e.g. TestLabel')}
          />
          <InputField
            inline={false}
            flexibleControlStateSize
            stacked
            label="Color"
            name="color"
            type="text"
            value={color}
            onChange={val => this.handleChange('color', val)}
            required
            placeholder={t('e.g. #ABCDEF')}
          />
        </Modal.Body>
        <Modal.Footer>
          <ButtonBar gap={1}>
            <Button type="button" onClick={onCanceled}>
              {t('Cancel')}
            </Button>
            <Button type="button" priority="primary" onClick={this.handleSubmit}>
              {primaryButtonText}
            </Button>
          </ButtonBar>
        </Modal.Footer>
      </Modal>
    );
  }
}
