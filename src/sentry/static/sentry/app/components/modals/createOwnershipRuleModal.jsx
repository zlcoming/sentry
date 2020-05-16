import PropTypes from 'prop-types';
import React from 'react';
import {css} from '@emotion/core';

import {t} from 'sentry/locale';
import ProjectOwnershipModal from 'sentry/views/settings/project/projectOwnership/modal';
import SentryTypes from 'sentry/sentryTypes';
import theme from 'sentry/utils/theme';

class CreateOwnershipRuleModal extends React.Component {
  static propTypes = {
    closeModal: PropTypes.func,
    onClose: PropTypes.func,
    Body: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,
    Header: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,
    organization: SentryTypes.Organization.isRequired,
    project: SentryTypes.Project,
  };

  handleSubmit = () => {
    this.handleSuccess();
  };

  handleSuccess = data => {
    if (this.props.onClose) {
      this.props.onClose(data);
    }
    window.setTimeout(this.props.closeModal, 2000);
  };

  render() {
    const {Body, Header, closeModal, ...props} = this.props;

    return (
      <React.Fragment>
        <Header closeButton onHide={closeModal}>
          {t('Create Ownership Rule')}
        </Header>
        <Body>
          <ProjectOwnershipModal {...props} onSave={this.handleSuccess} />
        </Body>
      </React.Fragment>
    );
  }
}

export const modalCss = css`
  @media (min-width: ${theme.breakpoints[0]}) {
    .modal-dialog {
      width: 80%;
      margin-left: -40%;
    }
  }
  .modal-content {
    overflow: initial;
  }
`;

export default CreateOwnershipRuleModal;
