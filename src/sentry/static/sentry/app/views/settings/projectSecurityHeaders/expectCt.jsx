import React from 'react';

import {t, tct} from 'sentry/locale';
import AsyncView from 'sentry/views/asyncView';
import ExternalLink from 'sentry/components/links/externalLink';
import {Panel, PanelBody, PanelHeader} from 'sentry/components/panels';
import PreviewFeature from 'sentry/components/previewFeature';
import ReportUri, {
  getSecurityDsn,
} from 'sentry/views/settings/projectSecurityHeaders/reportUri';
import SettingsPageHeader from 'sentry/views/settings/components/settingsPageHeader';
import routeTitleGen from 'sentry/utils/routeTitle';

export default class ProjectExpectCtReports extends AsyncView {
  getEndpoints() {
    const {orgId, projectId} = this.props.params;
    return [['keyList', `/projects/${orgId}/${projectId}/keys/`]];
  }

  getTitle() {
    const {projectId} = this.props.params;
    return routeTitleGen(t('Certificate Transparency (Expect-CT)'), projectId, false);
  }

  getInstructions() {
    return `Expect-CT: report-uri="${getSecurityDsn(this.state.keyList)}"`;
  }

  renderBody() {
    return (
      <div>
        <SettingsPageHeader title={t('Certificate Transparency')} />

        <PreviewFeature />

        <ReportUri keyList={this.state.keyList} params={this.props.params} />

        <Panel>
          <PanelHeader>{'About'}</PanelHeader>
          <PanelBody withPadding>
            <p>
              {tct(
                `[link:Certificate Transparency]
      (CT) is a security standard which helps track and identify valid certificates, allowing identification of maliciously issued certificates`,
                {
                  link: (
                    <ExternalLink href="https://en.wikipedia.org/wiki/Certificate_Transparency" />
                  ),
                }
              )}
            </p>
            <p>
              {tct(
                "To configure reports in Sentry, you'll need to configure the [header] a header from your server:",
                {
                  header: <code>Expect-CT</code>,
                }
              )}
            </p>

            <pre>{this.getInstructions()}</pre>

            <p>
              {tct('For more information, see [link:the article on MDN].', {
                link: (
                  <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expect-CT" />
                ),
              })}
            </p>
          </PanelBody>
        </Panel>
      </div>
    );
  }
}
