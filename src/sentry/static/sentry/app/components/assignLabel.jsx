import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

import DropdownLink from 'app/components/dropdownLink';
import FlowLayout from 'app/components/flowLayout';
import MenuItem from 'app/components/menuItem';
import IssueLabelModal from 'app/components/issueLabelModal';
import {t} from 'app/locale';

export default class AssignLabel extends React.Component {
  static propTypes = {
    onAssignLabel: PropTypes.func,
    onAddLabel: PropTypes.func,
    labels: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
      })
    ),
  };

  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
    };
  }

  onAddLabel = (name, color) => {
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
        <IssueLabelModal
          show={this.state.showModal}
          onSubmit={this.onAddLabel}
          onCanceled={() => this.setState({showModal: false})}
          primaryButtonText={t('Add Label')}
          title={t('Add Label')}
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
