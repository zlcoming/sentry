import {WIDGET_DISPLAY} from 'sentry/views/dashboards/constants';

import anonymousUsersAffected from '../queries/anonymousUsersAffected';
import knownUsersAffected from '../queries/knownUsersAffected';

const affectedUsers = {
  type: WIDGET_DISPLAY.LINE_CHART,
  queries: {discover: [knownUsersAffected, anonymousUsersAffected]},

  title: 'Affected Users',
  yAxisMapping: [[0], [1]],
};

export default affectedUsers;
