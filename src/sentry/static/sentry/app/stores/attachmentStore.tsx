/* eslint-disable sentry/no-react-hooks */
import React, {createContext, useReducer, useContext} from 'react';

import {EventAttachment} from 'app/types';

type State = {
  // Use `getAttachmentStoreKey` to generate key
  [key: string]: {
    attachments?: EventAttachment[];
    attachmentsLoading?: boolean;
    attachmentsError?: Error;
  };
};

export const INITIAL_STATE: State[string] = {
  attachments: undefined,
  attachmentsLoading: false,
  attachmentsError: undefined,
};
export const AttachmentContext = createContext({} as State);

/**
 * Actions
 */
export const LOAD_ATTACHMENTS = 'LOAD_ATTACHMENTS';
export const LOAD_ATTACHMENTS_SUCCESS = 'LOAD_ATTACHMENTS_SUCCESS';
export const LOAD_ATTACHMENTS_ERROR = 'LOAD_ATTACHMENTS_ERROR';
export const RESET_ATTACHMENTS = 'RESET_ATTACHMENTS';

/**
 * Action Creators
 */
export function loadAttachments(orgSlug: string, projectSlug: string, eventId: string) {
  return {
    type: LOAD_ATTACHMENTS,
    key: getAttachmentStoreKey(orgSlug, projectSlug, eventId),
  };
}

export function loadAttachmentsSuccess(
  orgSlug: string,
  projectSlug: string,
  eventId: string,
  attachments: EventAttachment[]
) {
  return {
    type: LOAD_ATTACHMENTS_SUCCESS,
    key: getAttachmentStoreKey(orgSlug, projectSlug, eventId),
    data: attachments,
  };
}

export function loadAttachmentsError(
  orgSlug: string,
  projectSlug: string,
  eventId: string,
  error: Error
) {
  return {
    type: LOAD_ATTACHMENTS_ERROR,
    key: getAttachmentStoreKey(orgSlug, projectSlug, eventId),
    data: error,
  };
}

export function resetAttachments() {
  return {type: RESET_ATTACHMENTS};
}

/**
 * Reducer
 */
export function todoReducer(state: State, action) {
  const {type, key, data} = action;

  switch (type) {
    case LOAD_ATTACHMENTS:
      state[key] = {...INITIAL_STATE, attachmentsLoading: true};
      return state;
    case LOAD_ATTACHMENTS_SUCCESS:
      state[key] = {...INITIAL_STATE, attachments: data};
      return state;
    case LOAD_ATTACHMENTS_ERROR:
      state[key] = {...INITIAL_STATE, attachmentsError: data};
      return state;
    case RESET_ATTACHMENTS:
      return {};
    default:
      return state;
  }
}

/**
 * TODO: Add Provider and Context for components to use
 *
 * .
 * .
 * .
 */

export function getAttachmentStoreKey(
  orgSlug: string,
  projectSlug: string,
  eventId: string
): string {
  return `${orgSlug} ${projectSlug} ${eventId}`;
}
