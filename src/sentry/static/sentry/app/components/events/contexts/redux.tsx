import React from 'react';

import {t} from 'sentry/locale';
import ContextBlock from 'sentry/components/events/contexts/contextBlock';
import {KeyValueListData} from 'sentry/components/events/interfaces/keyValueList/types';
import ClippedBox from 'sentry/components/clippedBox';

type Props = {
  alias: string;
  data: Record<string, any>;
};

class ReduxContextType extends React.Component<Props> {
  getKnownData(): KeyValueListData[] {
    return [
      {
        key: 'value',
        subject: t('Latest State'),
        value: this.props.data,
      },
    ];
  }

  render() {
    return (
      <ClippedBox clipHeight={250}>
        <ContextBlock knownData={this.getKnownData()} />
      </ClippedBox>
    );
  }
}

export default ReduxContextType;
