import React from 'react';

import {t} from 'app/locale';
import EventDataSection from 'app/components/events/eventDataSection';
import {isStacktraceNewestFirst} from 'app/components/events/interfaces/stacktrace';
import {defined} from 'app/utils';
import CrashTitle from 'app/components/events/interfaces/crashHeader/crashTitle';
import CrashActions from 'app/components/events/interfaces/crashHeader/crashActions';
import {StacktraceType, STACK_VIEW, STACK_TYPE} from 'app/types/stacktrace';
import {Event, Project} from 'app/types';

import Thread from './thread';
import ThreadSelector from './threadSelector';
import getThreadStacktrace from './threadSelector/getThreadStacktrace';
import getThreadException from './threadSelector/getThreadException';

function getIntendedStackView(thread, event) {
  const stacktrace = getThreadStacktrace(thread, event, false);
  return stacktrace && stacktrace.hasSystemFrames ? 'app' : 'full';
}

function findBestThread(threads) {
  // Search the entire threads list for a crashed thread with stack
  // trace.
  return (
    threads.find(thread => thread.crashed) ||
    threads.find(thread => thread.stacktrace) ||
    threads[0]
  );
}

const defaultProps = {
  hideGuide: false,
};

type Props = {
  event: Event;
  projectId: Project['id'];
  type: string;
  data: Record<string, any>;
} & typeof defaultProps;

type State = {
  activeThread: any;
  newestFirst: boolean;
  stackType: STACK_TYPE;
  stackView?: STACK_VIEW;
};

class ThreadsInterface extends React.Component<Props, State> {
  static defaultProps = defaultProps;

  constructor(props) {
    super(props);
    const thread = defined(props.data.values)
      ? findBestThread(props.data.values)
      : undefined;

    this.state = {
      activeThread: thread,
      stackView: thread ? getIntendedStackView(thread, props.event) : undefined,
      stackType: 'original',
      newestFirst: isStacktraceNewestFirst(),
    };
  }

  toggleStack = value => {
    this.setState({
      stackView: value,
    });
  };

  getStacktrace = () =>
    getThreadStacktrace(
      this.state.activeThread,
      this.props.event,
      this.state.stackType !== 'original'
    );

  getException = () => getThreadException(this.state.activeThread, this.props.event);

  onSelectNewThread = thread => {
    let newStackView = this.state.stackView;
    if (this.state.stackView !== 'raw') {
      newStackView = getIntendedStackView(thread, this.props.event);
    }
    this.setState({
      activeThread: thread,
      stackView: newStackView,
      stackType: 'original',
    });
  };

  handleChange = newState => {
    this.setState(newState);
  };

  render() {
    const threads = this.props.data.values || [];

    if (threads.length === 0) {
      return null;
    }

    const evt = this.props.event;
    const {projectId, hideGuide} = this.props;
    const {stackView, stackType, newestFirst, activeThread} = this.state;
    const exception = this.getException();
    const stacktrace = this.getStacktrace();

    const commonCrashHeaderProps = {
      newestFirst,
      hideGuide,
      onChange: this.handleChange,
    };

    const hasThreads = threads.length > 1;

    return (
      <EventDataSection
        event={evt}
        type={this.props.type}
        title={
          hasThreads ? (
            <CrashTitle
              title={null}
              beforeTitle={
                <ThreadSelector
                  threads={threads}
                  activeThread={activeThread}
                  event={this.props.event}
                  onChange={this.onSelectNewThread}
                />
              }
            />
          ) : (
            <CrashTitle title={t('Stacktrace')} />
          )
        }
        actions={
          <CrashActions
            stackView={stackView}
            platform={evt.platform}
            stacktrace={stacktrace}
            stackType={stackType}
            thread={hasThreads ? activeThread : undefined}
            exception={hasThreads ? exception : undefined}
            {...commonCrashHeaderProps}
          />
        }
        showPermalink={!hasThreads}
        wrapTitle={false}
      >
        <Thread
          data={activeThread}
          exception={exception}
          stackView={stackView}
          stackType={stackType}
          stacktrace={stacktrace}
          event={evt}
          newestFirst={newestFirst}
          projectId={projectId}
        />
      </EventDataSection>
    );
  }
}

export default ThreadsInterface;
