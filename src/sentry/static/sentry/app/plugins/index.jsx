import Registry from 'sentry/plugins/registry';
import BasePlugin from 'sentry/plugins/basePlugin';
import DefaultIssuePlugin from 'sentry/plugins/defaultIssuePlugin';

import SessionStackPlugin from './sessionstack';
import SessionStackContextType from './sessionstack/contexts/sessionstack';
import Jira from './jira';

const contexts = {};
const registry = new Registry();

// Register legacy plguins

// Sessionstack
registry.add('sessionstack', SessionStackPlugin);
contexts.sessionstack = SessionStackContextType;

// Jira
registry.add('jira', Jira);

export {BasePlugin, registry, DefaultIssuePlugin};

export default {
  BasePlugin,
  DefaultIssuePlugin,

  add: registry.add.bind(registry),
  addContext: function(id, component) {
    contexts[id] = component;
  },
  contexts,
  get: registry.get.bind(registry),
  isLoaded: registry.isLoaded.bind(registry),
  load: registry.load.bind(registry),
  loadAll: registry.loadAll.bind(registry),
};
