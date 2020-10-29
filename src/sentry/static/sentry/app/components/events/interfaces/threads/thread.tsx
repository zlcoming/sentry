import React from 'react';
import isNil from 'lodash/isNil';

import {t} from 'app/locale';
import {Project, Event} from 'app/types';
import {StacktraceType, STACK_VIEW, STACK_TYPE} from 'app/types/stacktrace';
import CrashContent from 'app/components/events/interfaces/crashContent';
import Pills from 'app/components/pills';
import Pill from 'app/components/pill';

type Props = {
  event: Event;
  projectId: Project['id'];
  data: Record<string, any>;
  stackView?: STACK_VIEW;
  stackType?: STACK_TYPE;
  newestFirst?: boolean;
  exception?: any;
  stacktrace?: StacktraceType;
};

const Thread = ({
  event,
  projectId,
  data,
  stackView = STACK_VIEW.APP,
  stackType = STACK_TYPE.ORIGINAL,
  newestFirst = false,
  exception,
  stacktrace,
}: Props) => {
  const renderPills = !isNil(data.id) || !!data.name;
  const hasMissingStacktrace = !(exception || stacktrace);

  return (
    <div className="thread">
      {renderPills && (
        <Pills>
          <Pill name={t('id')} value={data.id} />
          <Pill name={t('name')} value={data.name} />
          <Pill name={t('was active')} value={data.current} />
          <Pill name={t('errored')} className={data.crashed ? 'false' : 'true'}>
            {data.crashed ? t('yes') : t('no')}
          </Pill>
        </Pills>
      )}

      {hasMissingStacktrace ? (
        <div className="traceback missing-traceback">
          <ul>
            <li className="frame missing-frame">
              <div className="title">
                <span className="informal">
                  {data.crashed ? t('Thread Errored') : t('No or unknown stacktrace')}
                </span>
              </div>
            </li>
          </ul>
        </div>
      ) : (
        <CrashContent
          event={event}
          stackType={stackType}
          stackView={stackView}
          newestFirst={newestFirst}
          projectId={projectId}
          exception={exception}
          stacktrace={stacktrace}
        />
      )}
    </div>
  );
};

export default Thread;
