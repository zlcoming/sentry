import React from 'react';
import styled from '@emotion/styled';

import {t} from 'sentry/locale';
import Button from 'sentry/components/button';
import space from 'sentry/styles/space';
import Confirm from 'sentry/components/confirm';
import {IconDelete, IconDownload} from 'sentry/icons';
import withApi from 'sentry/utils/withApi';
import {Client} from 'sentry/api';

type Props = {
  api: Client;
  url: string | null;
  attachmentId: string;
  onDelete: (attachmentId: string) => void;
};

class EventAttachmentActions extends React.Component<Props> {
  handleDelete = async () => {
    const {api, url, onDelete, attachmentId} = this.props;

    if (url) {
      try {
        await api.requestPromise(url, {
          method: 'DELETE',
        });

        onDelete(attachmentId);
      } catch (_err) {
        // TODO: Error-handling
      }
    }
  };

  render() {
    const {url} = this.props;

    return (
      <React.Fragment>
        <DownloadButton
          size="xsmall"
          icon={<IconDownload size="xs" />}
          href={url ? `${url}?download=1` : ''}
          disabled={!url}
          title={!url ? t('Insufficient permissions to download attachments') : undefined}
        >
          {t('Download')}
        </DownloadButton>

        <Confirm
          confirmText={t('Delete')}
          message={t('Are you sure you wish to delete this file?')}
          priority="danger"
          onConfirm={this.handleDelete}
          disabled={!url}
        >
          <Button
            size="xsmall"
            icon={<IconDelete size="xs" />}
            disabled={!url}
            priority="danger"
            title={!url ? t('Insufficient permissions to delete attachments') : undefined}
          />
        </Confirm>
      </React.Fragment>
    );
  }
}

const DownloadButton = styled(Button)`
  margin-right: ${space(0.5)};
`;

export default withApi(EventAttachmentActions);
