import PropTypes from 'prop-types';
import React from 'react';

import ErrorBoundary from 'sentry/components/errorBoundary';
import ExceptionContent from 'sentry/components/events/interfaces/exceptionContent';
import RawExceptionContent from 'sentry/components/events/interfaces/rawExceptionContent';
import SentryTypes from 'sentry/sentryTypes';
import StacktraceContent from 'sentry/components/events/interfaces/stacktraceContent';
import rawStacktraceContent from 'sentry/components/events/interfaces/rawStacktraceContent';

class CrashContent extends React.Component {
  static propTypes = {
    event: SentryTypes.Event.isRequired,
    stackView: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    newestFirst: PropTypes.bool.isRequired,
    stackType: PropTypes.string,
    exception: PropTypes.object,
    stacktrace: PropTypes.object,
  };

  renderException = () => {
    const {event, stackView, stackType, newestFirst, exception, projectId} = this.props;
    return stackView === 'raw' ? (
      <RawExceptionContent
        eventId={event.id}
        projectId={projectId}
        type={stackType}
        values={exception.values}
        platform={event.platform}
      />
    ) : (
      <ExceptionContent
        type={stackType}
        stackView={stackView}
        values={exception.values}
        platform={event.platform}
        newestFirst={newestFirst}
        event={event}
      />
    );
  };

  renderStacktrace = () => {
    const {event, stackView, newestFirst, stacktrace} = this.props;
    return stackView === 'raw' ? (
      <pre className="traceback plain">
        {rawStacktraceContent(stacktrace, event.platform)}
      </pre>
    ) : (
      <StacktraceContent
        data={stacktrace}
        className="no-exception"
        includeSystemFrames={stackView === 'full'}
        platform={event.platform}
        event={event}
        newestFirst={newestFirst}
      />
    );
  };

  render() {
    if (this.props.exception) {
      return <ErrorBoundary mini>{this.renderException()}</ErrorBoundary>;
    }
    if (this.props.stacktrace) {
      return <ErrorBoundary mini>{this.renderStacktrace()}</ErrorBoundary>;
    }
    return null;
  }
}

export default CrashContent;
