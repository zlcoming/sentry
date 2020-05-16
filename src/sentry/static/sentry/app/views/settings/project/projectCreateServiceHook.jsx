import React from 'react';

import {t} from 'sentry/locale';
import AsyncView from 'sentry/views/asyncView';
import SettingsPageHeader from 'sentry/views/settings/components/settingsPageHeader';
import ServiceHookSettingsForm from 'sentry/views/settings/project/serviceHookSettingsForm';

export default class ProjectCreateServiceHook extends AsyncView {
  renderBody() {
    const {orgId, projectId} = this.props.params;
    return (
      <div className="ref-project-create-service-hook">
        <SettingsPageHeader title={t('Create Service Hook')} />
        <ServiceHookSettingsForm
          {...this.props}
          orgId={orgId}
          projectId={projectId}
          initialData={{events: []}}
        />
      </div>
    );
  }
}
