import PropTypes from 'prop-types';
import React from 'react';
import Modal from 'react-bootstrap/lib/Modal';
import styled from '@emotion/styled';

import {t} from 'app/locale';
import Button from 'app/components/button';
import DropdownLink from 'app/components/dropdownLink';
import FlowLayout from 'app/components/flowLayout';
import MenuItem from 'app/components/menuItem';
import InputField from 'app/views/settings/components/forms/inputField';
import ButtonBar from 'app/components/buttonBar';

class AddLabelModal extends React.Component {
  // TODO: Edit label modal
  static propTypes = {
    onAddLabel: PropTypes.func,
    onCanceled: PropTypes.func,
    show: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      color: '',
    };
  }

  handleSubmit = () => {
    const {name, color} = this.state;

    this.props.onAddLabel(name, color);
  };

  handleChange = (name, value) => {
    this.setState({[name]: value});
  };

  render() {
    const {show, onCanceled} = this.props;
    const {name, color} = this.state;
    return (
      <Modal show={show} animation={false} onHide={onCanceled}>
        <Modal.Header>
          <h4>Add Label</h4>
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
              {t('Add Label')}
            </Button>
          </ButtonBar>
        </Modal.Footer>
      </Modal>
    );
  }
}

class AssignLabel extends React.Component {
  static propTypes = {
    onAssignLabel: PropTypes.func,
    onAddLabel: PropTypes.func,
    labels: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        color: PropTypes.string,
      })
    ),
  };

  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
    };
  }

  handleAddLabel = (name, color) => {
    // TODO: error handling when can't add label, show error
    this.props.onAddLabel(name, color);
    this.setState({showModal: false});
  };

  render() {
    // Needs to wrap in an inline block for DropdownLink,
    // or else dropdown icon gets wrapped?
    const title = (
      <div style={{marginRight: 4}}>
        <FlowLayout center>Assign Label</FlowLayout>
      </div>
    );

    return (
      <DropdownLink
        className="add-label btn-sm btn btn-default"
        title={title}
        keepMenuOpen
      >
        <MenuItem noAnchor>
          {this.props.labels.map(label => (
            <StyledLabel
              key={label.id}
              title={label.name}
              onClick={() => this.props.onAssignLabel(label)}
              color={label.color}
              className="text-white"
            >
              {label.name}
            </StyledLabel>
          ))}
          <Label title="Add Label" onClick={() => this.setState({showModal: true})}>
            Add Label
          </Label>
        </MenuItem>
        <AddLabelModal
          show={this.state.showModal}
          onAddLabel={this.handleAddLabel}
          onCanceled={() => this.setState({showModal: false})}
        />
      </DropdownLink>
    );
  }
}

const Label = styled('a')`
  display: flex;
  align-items: center;
`;

const StyledLabel = styled(Label)`
  color: ${p => p.theme.white};
  background-color: ${p => (p.color[0] === '#' ? p.color : '#' + p.color)};
  font-weight: 700;
  padding: 2px 4px;
  margin: 2px 0;
`;

export default AssignLabel;
