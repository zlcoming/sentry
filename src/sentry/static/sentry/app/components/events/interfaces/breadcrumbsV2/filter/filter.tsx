import React from 'react';
import styled from '@emotion/styled';
import isEqual from 'lodash/isEqual';
import {css} from '@emotion/core';

import {t, tn} from 'app/locale';
import DropdownControl from 'app/components/dropdownControl';
import DropdownButton from 'app/components/dropdownButton';

import {Group} from './group';
import {Header} from './header';
import {Footer} from './footer';
import {Option} from './types';

type Props = {
  onFilter: (filterOptions: Array<Option>) => () => void;
  options: Array<Option>;
};

type State = {
  types: Array<Option>;
  levels: Option['levels'];
  checkedOptionsQuantity: number;
};

class Filter extends React.Component<Props, State> {
  state: State = {
    types: [],
    levels: [],
    checkedOptionsQuantity: 0,
  };

  componentDidUpdate(prevProps: Props) {
    if (!isEqual(this.props.options, prevProps.options)) {
      this.loadState();
    }
  }

  setCheckedOptionsQuantity = () => {
    // this.setState(prevState => ({
    //   checkedOptionsQuantity: prevState.filterGroups.filter(
    //     filterGroup => filterGroup.isChecked
    //   ).length,
    // }));
  };

  loadState() {
    const {options} = this.props;

    const levels = this.loadLevels();

    this.setState(
      {
        types: options,
        levels,
      },
      this.setCheckedOptionsQuantity
    );
  }

  loadLevels = () => {
    const {options} = this.props;

    const levels: Option['levels'] = [];

    for (const option of options) {
      for (const level of option.levels) {
        if (!levels.includes(level)) {
          levels.push(level);
        }
      }
    }

    return levels;
  };

  handleClickItem = () => {
    // this.setState(
    //   prevState => ({
    //     filterGroups: prevState.filterGroups.map(filterGroup => {
    //       if (filterGroup.groupType === groupType && filterGroup.type === type) {
    //         return {
    //           ...filterGroup,
    //           isChecked: !filterGroup.isChecked,
    //         };
    //       }
    //       return filterGroup;
    //     }),
    //   }),
    //   this.setCheckedOptionsQuantity
    // );
  };

  handleSelectAll = (selectAll: boolean) => {
    // this.setState(
    //   prevState => ({
    //     options: prevState.options.map(data => ({
    //       ...data,
    //       isChecked: selectAll,
    //     })),
    //   }),
    //   this.setCheckedOptionsQuantity
    // );
  };

  getDropDownButton = ({isOpen, getActorProps}) => {
    const {checkedOptionsQuantity} = this.state;

    const dropDownButtonProps = {
      buttonLabel: t('Filter By'),
      buttonPriority: 'default',
      hasDarkBorderBottomColor: false,
    };

    if (checkedOptionsQuantity > 0) {
      dropDownButtonProps.buttonLabel = tn(
        '%s Active Filter',
        '%s Active Filters',
        checkedOptionsQuantity
      );
      dropDownButtonProps.buttonPriority = 'primary';
      dropDownButtonProps.hasDarkBorderBottomColor = true;
    }

    return (
      <StyledDropdownButton
        {...getActorProps()}
        isOpen={isOpen}
        hasDarkBorderBottomColor={dropDownButtonProps.hasDarkBorderBottomColor}
        size="small"
        priority={dropDownButtonProps.buttonPriority}
      >
        {dropDownButtonProps.buttonLabel}
      </StyledDropdownButton>
    );
  };

  render() {
    const {onFilter} = this.props;
    const {types, levels, checkedOptionsQuantity} = this.state;

    console.log('filterGroups', levels);
    // const hasFilterGroupsGroupTypeLevel = filterGroups.find(
    //   filterGroup => filterGroup.groupType === FilterGroupType.LEVEL
    // );

    return (
      <Wrapper>
        <DropdownControl menuWidth="240px" blendWithActor button={this.getDropDownButton}>
          <React.Fragment>
            {/* <Header
                onSelectAll={this.handleSelectAll}
                selectedQuantity={checkedOptionsQuantity}
                isAllSelected={options.length === checkedOptionsQuantity}
              /> */}
            {/* <Group
              groupHeaderTitle={t('Type')}
              onClick={this.handleClickItem}
              data={filterGroups.filter(
                filterGroup => filterGroup.groupType === FilterGroupType.TYPE
              )}
            />
            {hasFilterGroupsGroupTypeLevel && (
              <Group
                groupHeaderTitle={t('Level')}
                onClick={this.handleClickItem}
                data={filterGroups.filter(
                  filterGroup => filterGroup.groupType === FilterGroupType.LEVEL
                )}
              />
            )} */}
            {/* {!isEqual(this.props.options, options) && (
              <Footer onSubmit={onFilter(options)} />
            )} */}
          </React.Fragment>
        </DropdownControl>
      </Wrapper>
    );
  }
}

export {Filter};

const StyledDropdownButton = styled(DropdownButton)<{hasDarkBorderBottomColor?: boolean}>`
  border-right: 0;
  z-index: ${p => p.theme.zIndex.dropdownAutocomplete.actor};
  border-radius: ${p =>
    p.isOpen
      ? `${p.theme.borderRadius} 0 0 0`
      : `${p.theme.borderRadius} 0 0 ${p.theme.borderRadius}`};
  white-space: nowrap;
  max-width: 200px;
  &:hover,
  &:active {
    border-right: 0;
  }
  ${p =>
    !p.isOpen &&
    p.hasDarkBorderBottomColor &&
    css`
      border-bottom-color: ${p.theme.button.primary.border};
    `}
`;

const Wrapper = styled('div')`
  position: relative;
  display: flex;
`;
