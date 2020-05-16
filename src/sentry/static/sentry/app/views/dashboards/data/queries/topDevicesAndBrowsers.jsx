/**
 * Top Errors by Device and Browsers
 */
import {t} from 'sentry/locale';

const topDevicesAndBrowsers = {
  name: t('Top Devices and Browsers'),
  fields: ['device.family', 'browser.name'],
  conditions: [],
  aggregations: [['count()', null, 'count']],
  limit: 10,
  groupby: [],
  orderby: '-count',
};

export default topDevicesAndBrowsers;
