import {Client} from 'sentry/api';
import {addErrorMessage, addSuccessMessage} from 'sentry/actionCreators/indicator';
import ConfigStore from 'sentry/stores/configStore';
import {User} from 'sentry/types';

type Identity = {
  id: string;
  providerLabel: string;
};

export async function disconnectIdentity(identity: Identity) {
  const api = new Client();

  try {
    await api.requestPromise(`/users/me/social-identities/${identity.id}/`, {
      method: 'DELETE',
    });
    addSuccessMessage(`Disconnected ${identity.providerLabel}`);
  } catch {
    addErrorMessage('Error disconnecting identity');
  }
}

export function updateUser(user: User) {
  // Ideally we'd fire an action but this is gonna get refactored soon anyway
  ConfigStore.set('user', user);
}

export function logout(api: Client) {
  return api.requestPromise('/auth/', {method: 'DELETE'});
}

export function removeAuthenticator(api: Client, userId: string, authId: string) {
  return api.requestPromise(`/users/${userId}/authenticators/${authId}/`, {
    method: 'DELETE',
  });
}
