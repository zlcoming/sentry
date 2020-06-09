import SentryAppInstallationStore from 'app/stores/sentryAppInstallationsStore';
import {Client} from 'app/api';
import {SentryAppInstallation} from 'app/types';

const fetchSentryAppInstallations = async (api: Client, orgSlug: string) => {
  console.log(
    '            ',
    window.m('async fetchSentryAppInstallations start', 'page-issue-details-start')
  );
  const installsUri = `/organizations/${orgSlug}/sentry-app-installations/`;

  const installs: SentryAppInstallation[] = await api.requestPromise(installsUri);
  console.log(
    '            ',
    window.m('async fetchSentryAppInstallations end', 'page-issue-details-start')
  );
  SentryAppInstallationStore.load(installs);
};

export default fetchSentryAppInstallations;
