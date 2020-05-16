import React from 'react';
import styled from '@emotion/styled';

import ControlState from 'sentry/views/settings/components/forms/field/controlState';
import {t} from 'sentry/locale';
import Tooltip from 'sentry/components/tooltip';
import {IconClose, IconCheckmark} from 'sentry/icons';

import {EventIdStatus} from '../../types';

type Props = {
  onClickIconClose: () => void;
  status?: EventIdStatus;
};

const EventIdFieldStatusIcon = ({status, onClickIconClose}: Props) => {
  switch (status) {
    case EventIdStatus.ERROR:
    case EventIdStatus.INVALID:
    case EventIdStatus.NOT_FOUND:
      return (
        <CloseIcon onClick={onClickIconClose}>
          <Tooltip title={t('Clear event ID')}>
            <StyledIconClose size="xs" />
          </Tooltip>
        </CloseIcon>
      );
    case EventIdStatus.LOADING:
      return <ControlState isSaving />;
    case EventIdStatus.LOADED:
      return <IconCheckmark color="green400" />;
    default:
      return null;
  }
};

export default EventIdFieldStatusIcon;

const CloseIcon = styled('div')`
  :first-child {
    line-height: 0;
  }
`;

const StyledIconClose = styled(IconClose)`
  color: ${p => p.theme.gray400};
  :hover {
    color: ${p => p.theme.gray500};
  }
  cursor: pointer;
`;
