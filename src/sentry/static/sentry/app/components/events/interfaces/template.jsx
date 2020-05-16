import PropTypes from 'prop-types';
import React from 'react';

import EventDataSection from 'sentry/components/events/eventDataSection';
import SentryTypes from 'sentry/sentryTypes';
import Frame from 'sentry/components/events/interfaces/frame/frame';
import {t} from 'sentry/locale';

class TemplateInterface extends React.Component {
  static propTypes = {
    event: SentryTypes.Event.isRequired,
    type: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
  };

  render() {
    return (
      <EventDataSection
        event={this.props.event}
        type={this.props.type}
        title={<div>{t('Template')}</div>}
      >
        <div className="traceback no-exception">
          <ul>
            <Frame data={this.props.data} isExpanded />
          </ul>
        </div>
      </EventDataSection>
    );
  }
}

export default TemplateInterface;
