import SentryAppInstallationStore from 'sentry/stores/sentryAppInstallationsStore';
import {Client} from 'sentry/api';
import {SentryAppInstallation} from 'sentry/types';

const fetchSentryAppInstallations = async (api: Client, orgSlug: string) => {
  const installsUri = `/organizations/${orgSlug}/sentry-app-installations/`;

  const installs: SentryAppInstallation[] = await api.requestPromise(installsUri);
  SentryAppInstallationStore.load(installs);
};

export default fetchSentryAppInstallations;
