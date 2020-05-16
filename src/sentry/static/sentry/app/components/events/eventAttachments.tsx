import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

import {Client} from 'sentry/api';
import {Event, EventAttachment} from 'sentry/types';
import {t} from 'sentry/locale';
import {Panel, PanelBody, PanelItem} from 'sentry/components/panels';
import EventAttachmentActions from 'sentry/components/events/eventAttachmentActions';
import EventDataSection from 'sentry/components/events/eventDataSection';
import FileSize from 'sentry/components/fileSize';
import overflowEllipsis from 'sentry/styles/overflowEllipsis';
import space from 'sentry/styles/space';
import AttachmentUrl from 'sentry/utils/attachmentUrl';
import withApi from 'sentry/utils/withApi';

type Props = {
  api: Client;
  event: Event;
  orgId: string;
  projectId: string;
};

type State = {
  attachmentList: EventAttachment[];
  expanded: boolean;
};

class EventAttachments extends React.Component<Props, State> {
  static propTypes: any = {
    api: PropTypes.object.isRequired,
    event: PropTypes.object.isRequired,
    orgId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
  };

  state: State = {
    attachmentList: [],
    expanded: false,
  };

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps: Props) {
    let doFetch = false;
    if (!prevProps.event && this.props.event) {
      // going from having no event to having an event
      doFetch = true;
    } else if (this.props.event && this.props.event.id !== prevProps.event.id) {
      doFetch = true;
    }

    if (doFetch) {
      this.fetchData();
    }
  }

  // TODO(dcramer): this API request happens twice, and we need a store for it
  async fetchData() {
    const {event} = this.props;

    if (!event) {
      return;
    }

    try {
      const data = await this.props.api.requestPromise(
        `/projects/${this.props.orgId}/${this.props.projectId}/events/${event.id}/attachments/`
      );

      this.setState({
        attachmentList: data,
      });
    } catch (_err) {
      // TODO: Error-handling
      this.setState({
        attachmentList: [],
      });
    }
  }

  handleDelete = async (deletedAttachmentId: string) => {
    this.setState(prevState => ({
      attachmentList: prevState.attachmentList.filter(
        attachment => attachment.id !== deletedAttachmentId
      ),
    }));
  };

  render() {
    const {attachmentList} = this.state;
    if (!attachmentList.length) {
      return null;
    }
    const {event, projectId} = this.props;
    const title = t('Attachments (%s)', attachmentList.length);

    return (
      <EventDataSection type="attachments" title={title}>
        <Panel>
          <PanelBody>
            {attachmentList.map(attachment => (
              <PanelItem key={attachment.id} alignItems="center">
                <AttachmentName>{attachment.name}</AttachmentName>
                <FileSizeWithGap bytes={attachment.size} />
                <AttachmentUrl
                  projectId={projectId}
                  eventId={event.id}
                  attachment={attachment}
                >
                  {url => (
                    <EventAttachmentActions
                      url={url}
                      onDelete={this.handleDelete}
                      attachmentId={attachment.id}
                    />
                  )}
                </AttachmentUrl>
              </PanelItem>
            ))}
          </PanelBody>
        </Panel>
      </EventDataSection>
    );
  }
}

export default withApi<Props>(EventAttachments);

const AttachmentName = styled('div')`
  flex: 1;
  margin-right: ${space(2)};
  font-weight: bold;
  ${overflowEllipsis};
`;

const FileSizeWithGap = styled(FileSize)`
  margin-right: ${space(2)};
`;
