import React from 'react';
import styled from '@emotion/styled';

import {EventGroupingConfig} from 'sentry/types';
import AsyncComponent from 'sentry/components/asyncComponent';
import DropdownAutoComplete from 'sentry/components/dropdownAutoComplete';
import DropdownButton from 'sentry/components/dropdownButton';
import Tooltip from 'sentry/components/tooltip';
import {t} from 'sentry/locale';

import {GroupingConfigItem} from '.';

type Props = AsyncComponent['props'] & {
  eventConfigId: string;
  configId: string;
  onSelect: (selection: any) => void;
};

type State = AsyncComponent['state'] & {
  configs: EventGroupingConfig[];
};

class GroupingConfigSelect extends AsyncComponent<Props, State> {
  getDefaultState() {
    return {
      ...super.getDefaultState(),
      configs: [],
    };
  }

  getEndpoints(): ReturnType<AsyncComponent['getEndpoints']> {
    return [['configs', '/grouping-configs/']];
  }

  renderLoading() {
    return this.renderBody();
  }

  renderBody() {
    const {configId, eventConfigId, onSelect} = this.props;
    const {configs} = this.state;

    const options = configs
      .filter(config => !config.hidden || config.id === eventConfigId)
      .map(({id}) => ({
        value: id,
        label: (
          <GroupingConfigItem isActive={id === eventConfigId}>{id}</GroupingConfigItem>
        ),
      }));

    return (
      <DropdownAutoComplete
        value={configId}
        onSelect={onSelect}
        alignMenu="left"
        selectedItem={configId}
        items={options}
      >
        {({isOpen}) => (
          <Tooltip title={t('Click here to experiment with other grouping configs')}>
            <StyledDropdownButton isOpen={isOpen} size="small">
              <GroupingConfigItem isActive={eventConfigId === configId}>
                {configId}
              </GroupingConfigItem>
            </StyledDropdownButton>
          </Tooltip>
        )}
      </DropdownAutoComplete>
    );
  }
}

const StyledDropdownButton = styled(DropdownButton)`
  font-weight: inherit;
`;

export default GroupingConfigSelect;
