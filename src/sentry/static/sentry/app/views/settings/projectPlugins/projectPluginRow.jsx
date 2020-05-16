import {css} from '@emotion/core';
import {Link} from 'react-router';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

import {t} from 'sentry/locale';
import ExternalLink from 'sentry/components/links/externalLink';
import Access from 'sentry/components/acl/access';
import PluginIcon from 'sentry/plugins/components/pluginIcon';
import SentryTypes from 'sentry/sentryTypes';
import Switch from 'sentry/components/switch';
import getDynamicText from 'sentry/utils/getDynamicText';
import recreateRoute from 'sentry/utils/recreateRoute';
import withOrganization from 'sentry/utils/withOrganization';
import withProject from 'sentry/utils/withProject';
import {trackIntegrationEvent} from 'sentry/utils/integrationUtil';

const grayText = css`
  color: #979ba0;
`;

class ProjectPluginRow extends React.PureComponent {
  static propTypes = {
    ...SentryTypes.Plugin,
    onChange: PropTypes.func,
  };

  handleChange = () => {
    const {onChange, id, enabled} = this.props;
    onChange(id, !enabled);
    trackIntegrationEvent(
      {
        eventKey: `integrations.${!enabled ? 'enabled' : 'disabled'}`,
        eventName: `Integrations: ${!enabled ? 'Enabled' : 'Disabled'}`,
        integration: id,
        integration_type: 'plugin',
        view: 'legacy_integrations',
        project_id: this.props.project.id,
      },
      this.props.organization
    );
  };

  render() {
    const {
      id,
      name,
      slug,
      version,
      author,
      hasConfiguration,
      enabled,
      canDisable,
    } = this.props;

    const configureUrl = recreateRoute(id, this.props);
    return (
      <Access access={['project:write']}>
        {({hasAccess}) => {
          const LinkOrSpan = hasAccess ? Link : 'span';

          return (
            <PluginItem key={id} className={slug}>
              <PluginInfo>
                <StyledPluginIcon size={48} pluginId={id} />
                <PluginDescription>
                  <PluginName>
                    {`${name} `}
                    {getDynamicText({
                      value: (
                        <Version>{version ? `v${version}` : <em>{t('n/a')}</em>}</Version>
                      ),
                      fixed: <Version>v10</Version>,
                    })}
                  </PluginName>
                  <div>
                    {author && (
                      <ExternalLink css={grayText} href={author.url}>
                        {author.name}
                      </ExternalLink>
                    )}
                    {hasConfiguration && (
                      <span>
                        {' '}
                        &middot;{' '}
                        <LinkOrSpan css={grayText} to={configureUrl}>
                          {t('Configure plugin')}
                        </LinkOrSpan>
                      </span>
                    )}
                  </div>
                </PluginDescription>
              </PluginInfo>
              <Switch
                size="lg"
                isDisabled={!hasAccess || !canDisable}
                isActive={enabled}
                toggle={this.handleChange}
              />
            </PluginItem>
          );
        }}
      </Access>
    );
  }
}

export default withOrganization(withProject(ProjectPluginRow));

const PluginItem = styled('div')`
  display: flex;
  flex: 1;
  align-items: center;
`;

const PluginDescription = styled('div')`
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

const PluginInfo = styled('div')`
  display: flex;
  flex: 1;
  line-height: 24px;
`;

const PluginName = styled('div')`
  font-size: 16px;
`;

const StyledPluginIcon = styled(PluginIcon)`
  margin-right: 16px;
`;

// Keeping these colors the same from old integrations page
const Version = styled('span')`
  color: #babec2;
`;
