import React from 'react';
import styled from '@emotion/styled';

import {t} from 'app/locale';
import SelectControl from 'app/components/forms/selectControl';
import TextField from 'app/components/forms/textField';
import {Panel, PanelBody, PanelHeader} from 'app/components/panels';
import {IconAdd} from 'app/icons/iconAdd';
import Button from 'app/components/button';

class ProjectDataPrivacyRulesForm extends React.Component {
  state = {
    method: 'mask',
    type: 'credit-card-numbers',
  };

  handlerChangeMethod(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      method: event.target.value,
    });
  }

  handlerChangeType(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      type: event.target.value,
    });
  }

  render() {
    return (
      <React.Fragment>
        <Panel>
          <PanelHeader>{t('Data Privacy Rules')}</PanelHeader>
          <PanelBody>
            <Flex>
              <StyledSelectControl
                onChange={this.handlerChangeMethod}
                value={this.state.method}
                options={[
                  {value: 'mask', label: 'Mask'},
                  {value: 'a', label: 'A'},
                ]}
                maxWidth="157px"
                height="40px"
              />
              <StyledSelectControl
                onChange={this.handlerChangeType}
                value={this.state.type}
                options={[{value: 'credit-card-numbers', label: 'Credit Card Numbers'}]}
                maxWidth="300px"
                height="40px"
              />
              <span>{t('from')}</span>
              <TextField name="okokokokoko" value="okokoko" />
              <Button size="large" icon="icon-trash" />
            </Flex>
            <Flex>
              <Button>
                <IconAdd />
                {t('Add a Rule')}
              </Button>
            </Flex>
          </PanelBody>
        </Panel>
        <Actions>
          <StyledButton title="Cancel" onClick={() => console.log('cancel')}>
            {t('Cancel')}
          </StyledButton>
          <StyledButton
            title="Save Rules"
            priority="primary"
            onClick={() => console.log('save')}
          >
            {t('Save Rules')}
          </StyledButton>
        </Actions>
      </React.Fragment>
    );
  }
}

export default ProjectDataPrivacyRulesForm;

const Flex = styled('div')`
  display: flex;
  align-items: center;
`;

const StyledButton = styled(Button)`
  width: 124px;
`;

const StyledSelectControl = styled(SelectControl)<{maxWidth: string}>`
  max-width: ${p => p.maxWidth};
  width: 100%;
  height: 40px;
`;

const Actions = styled('div')`
  display: flex;
  align-items: center;
  justify-content: flex-end;

  > * {
    margin-right: 14px;
    :last-child {
      margin-right: 0;
    }
  }
`;

// const FieldWrapper = styled('div')<{maxWidth?: string}>`
//   width: 100%;
//   max-width: ${p => p.maxWidth || 'auto'};
// `;
