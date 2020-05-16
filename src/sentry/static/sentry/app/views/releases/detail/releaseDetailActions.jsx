import React from 'react';
import {browserHistory} from 'react-router';
import styled from '@emotion/styled';

import {t} from 'sentry/locale';
import {addErrorMessage, addLoadingMessage} from 'sentry/actionCreators/indicator';
import SentryTypes from 'sentry/sentryTypes';
import Button from 'sentry/components/button';
import Confirm from 'sentry/components/confirm';
import {IconDelete} from 'sentry/icons';
import Feature from 'sentry/components/acl/feature';
import SwitchReleasesButton from 'sentry/views/releasesV2/utils/switchReleasesButton';
import ButtonBar from 'sentry/components/buttonBar';
import space from 'sentry/styles/space';

import {deleteRelease} from './utils';

export default class ReleaseDetailsActions extends React.Component {
  static propTypes = {
    organization: SentryTypes.Organization.isRequired,
    release: SentryTypes.Release.isRequired,
  };

  handleDelete = () => {
    const {organization, release} = this.props;
    const redirectPath = `/organizations/${organization.slug}/releases/`;
    addLoadingMessage(t('Deleting Release...'));

    deleteRelease(organization.slug, release.version)
      .then(() => {
        browserHistory.push(redirectPath);
      })
      .catch(() => {
        addErrorMessage(
          t('This release is referenced by active issues and cannot be removed.')
        );
      });
  };

  render() {
    const {organization} = this.props;

    return (
      <Wrapper>
        <ButtonBar gap={1}>
          <Confirm
            onConfirm={this.handleDelete}
            message={t(
              'Deleting this release is permanent. Are you sure you wish to continue?'
            )}
          >
            <Button size="small" icon={<IconDelete />}>
              {t('Delete')}
            </Button>
          </Confirm>

          <Feature features={['releases-v2']}>
            <SwitchReleasesButton version="2" orgId={organization.id} />
          </Feature>
        </ButtonBar>
      </Wrapper>
    );
  }
}

const Wrapper = styled('div')`
  display: flex;
  justify-content: flex-start;
  margin-bottom: ${space(3)};
`;
