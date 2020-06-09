import SentryAppComponentsActions from 'app/actions/sentryAppComponentActions';
import {Client} from 'app/api';
import {SentryAppComponent} from 'app/types';

export async function fetchSentryAppComponents(
  api: Client,
  orgSlug: string,
  projectId: string
): Promise<SentryAppComponent[]> {
  console.log(
    '            ',
    window.m('async fetchSentryAppComponents start', 'page-issue-details-start')
  );
  const componentsUri = `/organizations/${orgSlug}/sentry-app-components/?projectId=${projectId}`;

  const res = await api.requestPromise(componentsUri);
  console.log(
    '            ',
    window.m('async fetchSentryAppComponents end', 'page-issue-details-start')
  );
  SentryAppComponentsActions.loadComponents(res);
  return res;
}
