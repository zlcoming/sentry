import React from 'react';

import {getMeta} from 'sentry/components/events/meta/metaProxy';
import KeyValueList from 'sentry/components/events/interfaces/keyValueList/keyValueListV2';
import {KeyValueListData} from 'sentry/components/events/interfaces/keyValueList/types';

type Props = {
  data: {[key: string]: string};
};

const FrameVariables = ({data}: Props) => {
  // make sure that clicking on the variables does not actually do
  // anything on the containing element.
  const handlePreventToggling = () => (event: React.MouseEvent<HTMLTableElement>) => {
    event.stopPropagation();
  };

  const getTransformedData = (): Array<KeyValueListData> => {
    const transformedData: Array<KeyValueListData> = [];

    const dataKeys = Object.keys(data).reverse();
    for (const key of dataKeys) {
      transformedData.push({
        key,
        subject: key,
        value: data[key],
        meta: getMeta(data, key),
      });
    }
    return transformedData;
  };

  const transformedData = getTransformedData();

  return (
    <KeyValueList data={transformedData} onClick={handlePreventToggling} isContextData />
  );
};

export default FrameVariables;
