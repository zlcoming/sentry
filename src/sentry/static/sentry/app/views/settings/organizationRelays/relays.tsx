import React from 'react';
import {RouteComponentProps} from 'react-router/lib/Router';
import styled from '@emotion/styled';
import omit from 'lodash/omit';

import theme from 'sentry/utils/theme';
import {openModal} from 'sentry/actionCreators/modal';
import {PanelTable} from 'sentry/components/panels';
import {t, tct} from 'sentry/locale';
import AsyncComponent from 'sentry/components/asyncComponent';
import SettingsPageHeader from 'sentry/views/settings/components/settingsPageHeader';
import {Organization, Relay} from 'sentry/types';
import ExternalLink from 'sentry/components/links/externalLink';
import Button from 'sentry/components/button';
import {addErrorMessage, addSuccessMessage} from 'sentry/actionCreators/indicator';
import TextBlock from 'sentry/views/settings/components/text/textBlock';
import TextOverflow from 'sentry/components/textOverflow';
import Clipboard from 'sentry/components/clipboard';
import {IconAdd, IconCopy, IconEdit, IconDelete} from 'sentry/icons';
import DateTime from 'sentry/components/dateTime';
import space from 'sentry/styles/space';
import {defined} from 'sentry/utils';
import Tooltip from 'sentry/components/tooltip';
import QuestionTooltip from 'sentry/components/questionTooltip';
import overflowEllipsis from 'sentry/styles/overflowEllipsis';
import SentryDocumentTitle from 'sentry/components/sentryDocumentTitle';

import Add from './modals/add';
import Edit from './modals/edit';

const RELAY_DOCS_LINK = 'https://getsentry.github.io/relay/';

type Props = {
  organization: Organization;
} & RouteComponentProps<{orgId: string}, {}>;

type State = AsyncComponent['state'] & {
  relays: Array<Relay>;
};

class Relays extends AsyncComponent<Props, State> {
  getDefaultState() {
    return {
      ...super.getDefaultState(),
      relays: this.props.organization.trustedRelays,
    };
  }

  setRelays(trustedRelays: Array<Relay>) {
    this.setState({relays: trustedRelays});
  }

  handleDelete = (publicKey: Relay['publicKey']) => async () => {
    const {relays} = this.state;

    const trustedRelays = relays
      .filter(relay => relay.publicKey !== publicKey)
      .map(relay => omit(relay, ['created', 'lastModified']));

    try {
      const response = await this.api.requestPromise(
        `/organizations/${this.props.organization.slug}/`,
        {
          method: 'PUT',
          data: {trustedRelays},
        }
      );
      addSuccessMessage(t('Successfully deleted Relay public key'));
      this.setRelays(response.trustedRelays);
    } catch {
      addErrorMessage(t('An unknown error occurred while deleting Relay public key'));
    }
  };

  successfullySaved(response: Organization, successMessage: string) {
    addSuccessMessage(successMessage);
    this.setRelays(response.trustedRelays);
  }

  handleOpenEditDialog = (publicKey: Relay['publicKey']) => () => {
    const editRelay = this.state.relays.find(relay => relay.publicKey === publicKey);

    if (!editRelay) {
      return;
    }

    openModal(modalProps => (
      <Edit
        {...modalProps}
        savedRelays={this.state.relays}
        api={this.api}
        orgSlug={this.props.organization.slug}
        relay={editRelay}
        onSubmitSuccess={response => {
          this.successfullySaved(response, t('Successfully updated Relay public key'));
        }}
      />
    ));
  };

  handleOpenAddDialog = () => {
    openModal(modalProps => (
      <Add
        {...modalProps}
        savedRelays={this.state.relays}
        api={this.api}
        orgSlug={this.props.organization.slug}
        onSubmitSuccess={response => {
          this.successfullySaved(response, t('Successfully added Relay public key'));
        }}
      />
    ));
  };

  renderBody() {
    const {relays} = this.state;
    const title = t('Relays');

    return (
      <React.Fragment>
        <SentryDocumentTitle title={title} objSlug={this.props.organization.slug} />
        <SettingsPageHeader
          title={title}
          action={
            <Button
              priority="primary"
              size="small"
              icon={<IconAdd size="xs" isCircled />}
              onClick={this.handleOpenAddDialog}
            >
              {t('New Relay Key')}
            </Button>
          }
        />
        <TextBlock>
          {tct(
            `Relay is a relay service built by Sentry. You can run this on-premise for your SDKs or server to customize data scrubbing, buffering retries and more. You can generate Relay keys for access. For more on how to set this up, read the [link:docs].`,
            {
              link: <ExternalLink href={RELAY_DOCS_LINK} />,
            }
          )}
        </TextBlock>
        <StyledPanelTable
          isEmpty={relays.length === 0}
          emptyMessage={t('No relays keys have been added yet.')}
          headers={[t('Display Name'), t('Relay Key'), t('Date Created'), '']}
        >
          {relays.map(({publicKey: key, name, created, description}) => {
            const maskedKey = '*************************';
            return (
              <React.Fragment key={key}>
                <Name>
                  <Text>{name}</Text>
                  {description && (
                    <QuestionTooltip position="top" size="sm" title={description} />
                  )}
                </Name>
                <KeyWrapper>
                  <Key content={maskedKey}>{maskedKey}</Key>
                  <IconWrapper>
                    <Clipboard value={key}>
                      <Tooltip title={t('Click to copy')} containerDisplayMode="flex">
                        <IconCopy color="gray500" />
                      </Tooltip>
                    </Clipboard>
                  </IconWrapper>
                </KeyWrapper>
                <Text>
                  {!defined(created) ? t('Unknown') : <DateTime date={created} />}
                </Text>
                <Actions>
                  <Button
                    size="small"
                    title={t('Edit Key')}
                    label={t('Edit Key')}
                    icon={<IconEdit size="sm" />}
                    onClick={this.handleOpenEditDialog(key)}
                  />
                  <Button
                    size="small"
                    title={t('Delete Key')}
                    label={t('Delete Key')}
                    onClick={this.handleDelete(key)}
                    icon={<IconDelete size="sm" />}
                  />
                </Actions>
              </React.Fragment>
            );
          })}
        </StyledPanelTable>
      </React.Fragment>
    );
  }
}

export default Relays;

const StyledPanelTable = styled(PanelTable)`
  grid-template-columns: repeat(3, auto) max-content;
  > * {
    @media (max-width: ${theme.breakpoints[0]}) {
      padding: ${space(1)};
    }
  }
`;

const KeyWrapper = styled('div')`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-gap: ${space(1)};
  align-items: center;
`;

const IconWrapper = styled('div')`
  justify-content: flex-start;
  display: flex;
  cursor: pointer;
`;

const Text = styled(TextOverflow)`
  color: ${p => p.theme.gray700};
  line-height: 30px;
`;

const Key = styled(Text)<{content: string}>`
  visibility: hidden;
  position: relative;
  :after {
    position: absolute;
    top: 4px;
    left: 0;
    content: '${p => p.content}';
    visibility: visible;
    ${overflowEllipsis};
  }
`;

const Actions = styled('div')`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-gap: ${space(1)};
  align-items: center;
`;

const Name = styled(Actions)``;
