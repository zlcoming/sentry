import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';
import Reflux from 'reflux';

import {
  DATE_TIME,
  URL_PARAM,
  LOCAL_STORAGE_KEY,
} from 'app/constants/globalSelectionHeader';
import {getStateFromQuery} from 'app/components/organizations/globalSelectionHeader/utils';
import {getParams} from 'app/components/organizations/globalSelectionHeader/getParams';
import {isEqualWithDates} from 'app/utils/isEqualWithDates';
import OrganizationsStore from 'app/stores/organizationsStore';
import GlobalSelectionActions from 'app/actions/globalSelectionActions';
import localStorage from 'app/utils/localStorage';

const DEFAULT_PARAMS = getParams({});

const getDefaultSelection = () => ({
  projects: [],
  environments: [],
  datetime: {
    [DATE_TIME.START]: DEFAULT_PARAMS.start || null,
    [DATE_TIME.END]: DEFAULT_PARAMS.end || null,
    [DATE_TIME.PERIOD]: DEFAULT_PARAMS.statsPeriod || null,
    [DATE_TIME.UTC]: DEFAULT_PARAMS.utc || null,
  },
});

const getProjectsByIds = async (organization, projectIds, api) => {
  const query = {};
  query.query = projectIds.map(id => `id:${id}`).join(' ');
  return await api.requestPromise(`/organizations/${organization.slug}/projects/`, {
    query,
  });
};

const isValidSelection = async (selection, organization, api) => {
  if (organization.projects) {
    const allowedProjects = new Set(
      organization.projects
        .filter(project => project.hasAccess)
        .map(p => parseInt(p.id, 10))
    );
    if (
      Array.isArray(selection.projects) &&
      selection.projects.some(project => !allowedProjects.has(project))
    ) {
      return false;
    }
    return true;
  } else {
    // if the selection is [-1] (all projects) or [] (my projects) return true
    if (selection.projects.length === 0 || selection.projects[0] === -1) {
      return true;
    }
    // if we do not have organization.projects then make an API call to fetch projects based on id
    const projects = await getProjectsByIds(organization, selection.projects, api);
    if (
      selection.projects.length !== projects.length ||
      projects.some(project => !project.hasAccess)
    ) {
      return false;
    }
    return true;
  }
};

const GlobalSelectionStore = Reflux.createStore({
  init() {
    this.reset(this.selection);
    this.listenTo(GlobalSelectionActions.reset, this.onReset);
    this.listenTo(GlobalSelectionActions.initializeUrlState, this.onInitializeUrlState);
    this.listenTo(GlobalSelectionActions.save, this.onSave);
    this.listenTo(GlobalSelectionActions.updateProjects, this.updateProjects);
    this.listenTo(GlobalSelectionActions.updateDateTime, this.updateDateTime);
    this.listenTo(GlobalSelectionActions.updateEnvironments, this.updateEnvironments);
  },

  reset(state) {
    this._hasLoaded = false;
    this._hasInitialState = false;
    this.selection = state || getDefaultSelection();
  },

  isReady() {
    return this._hasLoaded && this._hasInitialState;
  },

  /**
   * Initializes the global selection store data
   * Use query params if they exist, otherwise check local storage
   */
  onInitializeUrlState(orgSlug, queryParams, {skipLastUsed} = {}) {
    this._hasInitialState = true;

    // We only save environment and project, so if those exist in
    // URL, do not touch local storage
    const query = pick(queryParams, [URL_PARAM.PROJECT, URL_PARAM.ENVIRONMENT]);
    const hasProjectOrEnvironmentInUrl = Object.keys(query).length > 0;
    const parsed = getStateFromQuery(queryParams);

    let globalSelection = getDefaultSelection();

    globalSelection.datetime = {
      [DATE_TIME.START]: parsed.start || null,
      [DATE_TIME.END]: parsed.end || null,
      [DATE_TIME.PERIOD]: parsed.period || null,
      [DATE_TIME.UTC]: parsed.utc || null,
    };

    if (hasProjectOrEnvironmentInUrl) {
      globalSelection.projects = parsed.project || [];
      globalSelection.environments = parsed.environment || [];
    } else if (!skipLastUsed) {
      try {
        const localStorageKey = `${LOCAL_STORAGE_KEY}:${orgSlug}`;
        const storedValue = localStorage.getItem(localStorageKey);

        if (storedValue) {
          globalSelection = {
            datetime: globalSelection.datetime,
            ...JSON.parse(storedValue),
          };
        }
      } catch (ex) {
        // use default if invalid
        console.error(ex); // eslint-disable-line no-console
      }
    }

    this.selection = globalSelection;
    this.trigger(this.get());
  },
  /**
   * Initializes the global selection store
   * If there are query params apply these, otherwise check local storage
   */
  loadInitialData(organization, {api} = {}) {
    this.organization = organization;
    this._hasLoaded = true;
    this.loadSelectionIfValid(this.selection, organization, api);
  },

  async loadSelectionIfValid(globalSelection, organization, api) {
    // if (await isValidSelection(globalSelection, organization, api)) {
    this.selection = globalSelection;
    this.trigger(this.get());
    // }
  },

  get() {
    return {
      selection: this.selection,
      isReady: this.isReady(),
    };
  },

  onReset() {
    this.reset();
    this.trigger(this.get());
  },

  updateProjects(projects = []) {
    if (isEqual(this.selection.projects, projects)) {
      return;
    }

    this.selection = {
      ...this.selection,
      projects,
    };

    this.trigger(this.get());
  },

  updateDateTime(datetime) {
    if (isEqualWithDates(this.selection.datetime, datetime)) {
      return;
    }

    this.selection = {
      ...this.selection,
      datetime,
    };
    this.trigger(this.get());
  },

  updateEnvironments(environments = []) {
    if (isEqual(this.selection.environments, environments)) {
      return;
    }

    this.selection = {
      ...this.selection,
      environments,
    };
    this.trigger(this.get());
  },

  /**
   * Save to local storage when user explicitly changes header values.
   *
   * e.g. if localstorage is empty, user loads issue details for project "foo"
   * this should not consider "foo" as last used and should not save to local storage.
   *
   * However, if user then changes environment, it should...? Currently it will
   * save the current project alongside environment to local storage. It's debatable if
   * this is the desired behavior.
   */
  onSave(updateObj) {
    // Do nothing if no org is loaded or user is not an org member. Only
    // organizations that a user has membership in will be available via the
    // organizations store
    if (!this.organization || !OrganizationsStore.get(this.organization.slug)) {
      return;
    }

    const {project, environment} = updateObj;

    try {
      const localStorageKey = `${LOCAL_STORAGE_KEY}:${this.organization.slug}`;
      const dataToSave = {
        projects: project || this.selection.projects,
        environments: environment || this.selection.environments,
      };
      localStorage.setItem(localStorageKey, JSON.stringify(dataToSave));
    } catch (ex) {
      // Do nothing
    }
  },
});

export default GlobalSelectionStore;
