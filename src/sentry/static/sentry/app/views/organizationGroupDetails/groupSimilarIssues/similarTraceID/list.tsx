import React from 'react';

import {t} from 'app/locale';
import {Organization} from 'app/types';
import {TableDataRow} from 'app/utils/discover/discoverQuery';
import {Panel, PanelBody} from 'app/components/panels';
import StreamGroup from 'app/components/stream/group';
import GroupListHeader from 'app/components/issues/groupListHeader';
import EmptyStateWarning from 'app/components/emptyStateWarning';
import GroupStore from 'app/stores/groupStore';

type Stacktrace = {
  id: string;
  issue: string;
  ['issue.id']: number;
  project: string;
  timestamp: string;
  title: string;
};

type Props = {
  stackTraces: Array<TableDataRow>;
  organization: Organization;
};

// List events that have the same tracing ID as the current Event
const List = ({organization, ...props}: Props) => {
  const orgSlug = organization.slug;
  const stackTraces = props.stackTraces as Array<Stacktrace>;

  const all = GroupStore.getAll();

  console.log('all', all);

  return (
    <Panel>
      <PanelBody>
        <GroupListHeader withChart={false} />
        {!stackTraces.length ? (
          <EmptyStateWarning small>
            {t('No similar issues have been found.')}
          </EmptyStateWarning>
        ) : (
          stackTraces.map(stackTrace => (
            <StreamGroup
              key={stackTrace.id}
              id={String(stackTrace['issue.id'])}
              orgId={orgSlug}
              withChart={false}
              canSelect={false}
            />
          ))
        )}
      </PanelBody>
    </Panel>
  );
};

export default List;
