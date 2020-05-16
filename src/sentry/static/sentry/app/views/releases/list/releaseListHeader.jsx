import React from 'react';

import {PanelHeader} from 'sentry/components/panels';
import {t} from 'sentry/locale';

import {
  LastEventColumn,
  Layout,
  CountColumn,
  VersionColumn,
  ProjectsColumn,
  StatsColumn,
} from './layout';

const ReleaseListHeader = () => (
  <PanelHeader>
    <Layout>
      <VersionColumn>{t('Version')}</VersionColumn>
      <ProjectsColumn>{t('Project')}</ProjectsColumn>
      <StatsColumn />
      <CountColumn>{t('New Issues')}</CountColumn>
      <LastEventColumn>{t('Last Event')}</LastEventColumn>
    </Layout>
  </PanelHeader>
);
export default ReleaseListHeader;
