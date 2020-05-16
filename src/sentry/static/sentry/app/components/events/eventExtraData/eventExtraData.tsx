import React from 'react';

import {Event} from 'sentry/types';
import {t} from 'sentry/locale';
import EventDataSection from 'sentry/components/events/eventDataSection';
import SentryTypes from 'sentry/sentryTypes';

import EventDataContent from './eventDataContent';

type Props = {
  event: Event;
};

type State = {
  raw: boolean;
};

class EventExtraData extends React.Component<Props, State> {
  static propTypes = {
    event: SentryTypes.Event.isRequired,
  };

  state: State = {
    raw: false,
  };

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return this.props.event.id !== nextProps.event.id || this.state.raw !== nextState.raw;
  }

  toggleRaw = (shouldBeRaw: boolean) => {
    this.setState({
      raw: shouldBeRaw,
    });
  };

  render() {
    return (
      <div className="extra-data">
        <EventDataSection
          type="extra"
          title={t('Additional Data')}
          toggleRaw={this.toggleRaw}
          raw={this.state.raw}
        >
          <EventDataContent raw={this.state.raw} data={this.props.event.context} />
        </EventDataSection>
      </div>
    );
  }
}

export default EventExtraData;
