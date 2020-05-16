import {KeyValueListData} from 'sentry/components/events/interfaces/keyValueList/types';
import {getMeta} from 'sentry/components/events/meta/metaProxy';
import {defined} from 'sentry/utils';

import getAppKnownDataDetails from './getAppKnownDataDetails';
import {AppData, AppKnownDataType} from './types';

function getAppKnownData(
  data: AppData,
  appKnownDataValues: Array<AppKnownDataType>
): Array<KeyValueListData> {
  const knownData: Array<KeyValueListData> = [];

  const dataKeys = appKnownDataValues.filter(appKnownDataValue =>
    defined(data[appKnownDataValue])
  );

  for (const key of dataKeys) {
    const knownDataDetails = getAppKnownDataDetails(data, key as AppKnownDataType);

    knownData.push({
      key,
      ...knownDataDetails,
      meta: getMeta(data, key),
    });
  }
  return knownData;
}

export default getAppKnownData;
