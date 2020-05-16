import {KeyValueListData} from 'sentry/components/events/interfaces/keyValueList/types';
import {getMeta} from 'sentry/components/events/meta/metaProxy';
import {defined} from 'sentry/utils';

import getGpuKnownDataDetails from './getGPUKnownDataDetails';
import {GPUData, GPUKnownDataType} from './types';

function getGPUKnownData(
  data: GPUData,
  gpuKnownDataValues: Array<GPUKnownDataType>
): Array<KeyValueListData> {
  const knownData: Array<KeyValueListData> = [];

  const dataKeys = gpuKnownDataValues.filter(gpuKnownDataValue =>
    defined(data[gpuKnownDataValue])
  );

  for (const key of dataKeys) {
    const knownDataDetails = getGpuKnownDataDetails(data, key as GPUKnownDataType);

    knownData.push({
      key,
      ...knownDataDetails,
      meta: getMeta(data, key),
    });
  }
  return knownData;
}

export default getGPUKnownData;
