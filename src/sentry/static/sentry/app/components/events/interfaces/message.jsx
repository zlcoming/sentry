import PropTypes from 'prop-types';
import React from 'react';

import KeyValueList from 'sentry/components/events/interfaces/keyValueList/keyValueList';
import Annotated from 'sentry/components/events/meta/annotated';
import EventDataSection from 'sentry/components/events/eventDataSection';
import SentryTypes from 'sentry/sentryTypes';
import {t} from 'sentry/locale';
import {objectIsEmpty} from 'sentry/utils';

class MessageInterface extends React.Component {
  static propTypes = {
    event: SentryTypes.Event.isRequired,
    data: PropTypes.object.isRequired,
  };

  renderParams() {
    let {params} = this.props.data;
    if (objectIsEmpty(params)) {
      return null;
    }

    // NB: Always render params, regardless of whether they appear in the
    // formatted string due to structured logging frameworks, like Serilog. They
    // only format some parameters into the formatted string, but we want to
    // display all of them.

    if (Array.isArray(params)) {
      params = params.map((value, i) => [`#${i}`, value]);
    }

    return <KeyValueList data={params} isSorted={false} isContextData />;
  }

  render() {
    const {data, event} = this.props;

    return (
      <EventDataSection event={event} type="message" title={t('Message')}>
        <pre className="plain">
          <Annotated object={data} objectKey="formatted" />
        </pre>
        {this.renderParams()}
      </EventDataSection>
    );
  }
}

export default MessageInterface;
