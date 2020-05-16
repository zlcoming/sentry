import React from 'react';

import {Event} from 'sentry/types';
import {t} from 'sentry/locale';
import ClippedBox from 'sentry/components/clippedBox';
import ErrorBoundary from 'sentry/components/errorBoundary';
import EventDataSection from 'sentry/components/events/eventDataSection';
import KeyValueList from 'sentry/components/events/interfaces/keyValueList/keyValueList';
import SentryTypes from 'sentry/sentryTypes';

type Props = {
  event: Event;
};

class EventPackageData extends React.Component<Props> {
  static propTypes = {
    event: SentryTypes.Event.isRequired,
  };

  shouldComponentUpdate(nextProps: Props) {
    return this.props.event.id !== nextProps.event.id;
  }

  render() {
    const {event} = this.props;
    let longKeys: boolean, title: string;
    const packages = Object.entries(event.packages || {});

    switch (event.platform) {
      case 'csharp':
        longKeys = true;
        title = t('Assemblies');
        break;
      default:
        longKeys = false;
        title = t('Packages');
    }

    return (
      <EventDataSection type="packages" title={title}>
        <ClippedBox>
          <ErrorBoundary mini>
            <KeyValueList data={packages} longKeys={longKeys} />
          </ErrorBoundary>
        </ClippedBox>
      </EventDataSection>
    );
  }
}

export default EventPackageData;
