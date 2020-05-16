import React from 'react';

import {Organization, Project} from 'sentry/types';
import {Panel, PanelBody, PanelHeader} from 'sentry/components/panels';
import {removeAtArrayIndex} from 'sentry/utils/removeAtArrayIndex';
import {replaceAtArrayIndex} from 'sentry/utils/replaceAtArrayIndex';
import {t} from 'sentry/locale';
import TriggerForm from 'sentry/views/settings/incidentRules/triggers/form';
import withProjects from 'sentry/utils/withProjects';
import ActionsPanel from 'sentry/views/settings/incidentRules/triggers/actionsPanel';

import {
  AlertRuleThresholdType,
  MetricActionTemplate,
  Trigger,
  UnsavedIncidentRule,
  Action,
} from '../types';

type Props = {
  organization: Organization;
  projects: Project[];
  ruleId?: string;
  triggers: Trigger[];
  resolveThreshold: UnsavedIncidentRule['resolveThreshold'];
  thresholdType: UnsavedIncidentRule['thresholdType'];
  currentProject: string;
  availableActions: MetricActionTemplate[] | null;
  disabled: boolean;

  errors: Map<number, {[fieldName: string]: string}>;

  onChange: (
    triggers: Trigger[],
    triggerIndex?: number,
    changeObj?: Partial<Trigger>
  ) => void;
  onThresholdTypeChange: (thresholdType: AlertRuleThresholdType) => void;
  onResolveThresholdChange: (
    resolveThreshold: UnsavedIncidentRule['resolveThreshold']
  ) => void;
};

/**
 * A list of forms to add, edit, and delete triggers.
 */
class Triggers extends React.Component<Props> {
  handleDeleteTrigger = (index: number) => {
    const {triggers, onChange} = this.props;
    const updatedTriggers = removeAtArrayIndex(triggers, index);

    onChange(updatedTriggers);
  };

  handleChangeTrigger = (
    triggerIndex: number,
    trigger: Trigger,
    changeObj: Partial<Trigger>
  ) => {
    const {triggers, onChange} = this.props;
    const updatedTriggers = replaceAtArrayIndex(triggers, triggerIndex, trigger);
    onChange(updatedTriggers, triggerIndex, changeObj);
  };

  handleAddAction = (triggerIndex: number, action: Action) => {
    const {onChange, triggers} = this.props;
    const trigger = triggers[triggerIndex];
    const actions = [...trigger.actions, action];
    const updatedTriggers = replaceAtArrayIndex(triggers, triggerIndex, {
      ...trigger,
      actions,
    });
    onChange(updatedTriggers, triggerIndex, {actions});
  };

  handleChangeActions = (
    triggerIndex: number,
    triggers: Trigger[],
    actions: Action[]
  ): void => {
    const {onChange} = this.props;
    const trigger = triggers[triggerIndex];
    const updatedTriggers = replaceAtArrayIndex(triggers, triggerIndex, {
      ...trigger,
      actions,
    });
    onChange(updatedTriggers, triggerIndex, {actions});
  };

  render() {
    const {
      availableActions,
      currentProject,
      errors,
      organization,
      projects,
      triggers,
      disabled,
      thresholdType,
      resolveThreshold,
      onThresholdTypeChange,
      onResolveThresholdChange,
    } = this.props;

    // Note we only support 2 triggers max
    return (
      <React.Fragment>
        <Panel>
          <PanelHeader>{t('Set A Threshold')}</PanelHeader>
          <PanelBody>
            <TriggerForm
              disabled={disabled}
              errors={errors}
              organization={organization}
              projects={projects}
              triggers={triggers}
              resolveThreshold={resolveThreshold}
              thresholdType={thresholdType}
              onChange={this.handleChangeTrigger}
              onThresholdTypeChange={onThresholdTypeChange}
              onResolveThresholdChange={onResolveThresholdChange}
            />
          </PanelBody>
        </Panel>

        <ActionsPanel
          disabled={disabled}
          loading={availableActions === null}
          error={false}
          availableActions={availableActions}
          currentProject={currentProject}
          organization={organization}
          projects={projects}
          triggers={triggers}
          onChange={this.handleChangeActions}
          onAdd={this.handleAddAction}
        />
      </React.Fragment>
    );
  }
}

export default withProjects(Triggers);
