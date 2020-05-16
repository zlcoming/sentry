import React from 'react';
import styled from '@emotion/styled';

import space from 'sentry/styles/space';
import ExternalLink from 'sentry/components/links/externalLink';
import Alert from 'sentry/components/alert';
import AlertActions from 'sentry/actions/alertActions';
import Button from 'sentry/components/button';
import {IconCheckmark, IconClose, IconWarning} from 'sentry/icons';
import {t} from 'sentry/locale';

type AlertType = {
  /**
   * A lot of alerts coming from getsentry do not have an `id`
   */
  id?: string;
  message: React.ReactNode;
  type: 'success' | 'error' | 'warning' | 'info';
  url?: string;
};

type Props = {
  alert: AlertType;
  system: boolean;
};

const AlertMessage = ({alert, system}: Props) => {
  const handleCloseAlert = () => {
    AlertActions.closeAlert(alert);
  };

  const {url, message, type} = alert;
  const icon =
    type === 'success' ? (
      <IconCheckmark size="md" isCircled />
    ) : (
      <IconWarning size="md" />
    );

  return (
    <StyledAlert type={type} icon={icon} system={system}>
      <StyledMessage>
        {url ? <ExternalLink href={url}>{message}</ExternalLink> : message}
      </StyledMessage>
      <StyledCloseButton
        icon={<IconClose size="md" isCircled />}
        aria-label={t('Close')}
        onClick={handleCloseAlert}
        size="zero"
        borderless
      />
    </StyledAlert>
  );
};

export default AlertMessage;

const StyledAlert = styled(Alert)`
  padding: ${space(1)} ${space(2)};
  margin: 0;
`;

const StyledMessage = styled('span')`
  display: block;
  margin: auto ${space(4)} auto 0;
`;

const StyledCloseButton = styled(Button)`
  background-color: transparent;
  opacity: 0.4;
  transition: opacity 0.1s linear;
  position: absolute;
  top: 0;
  right: 0;

  &:hover,
  &:focus {
    background-color: transparent;
    opacity: 1;
  }
`;
