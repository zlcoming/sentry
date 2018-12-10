// @ts-nocheck
/* eslint-disable */
import {css, ClassNames} from '@emotion/core';
import React from 'react';
import assign from 'lodash/assign';
import classnames from 'classnames';
import debounce from 'lodash/debounce';
import flatten from 'lodash/flatten';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import memoize from 'lodash/memoize';
import styled from '@emotion/styled';

import {IconClose, IconSearch} from 'app/icons';
import {FIELDS, TRACING_FIELDS} from 'app/utils/discover/fields';
import {NEGATION_OPERATOR, SEARCH_WILDCARD} from 'app/constants';
import {SearchType} from 'app/components/smartSearchBar';
import {
  addSpace,
  removeSpace,
  createSearchGroups,
  filterSearchGroupsByIndex,
} from 'app/components/smartSearchBar/utils';
import {defined} from 'app/utils';
import {fetchTagValues} from 'app/actionCreators/tags';
import {t} from 'app/locale';
import Button from 'app/components/button';
import DropdownAutoCompleteMenu from 'app/components/dropdownAutoCompleteMenu';
import space from 'app/styles/space';
import withApi from 'app/utils/withApi';
import withTags from 'app/utils/withTags';
import {Organization, Tag} from 'app/types';
import {Client} from 'app/api';
import InlineSvg from 'app/components/inlineSvg';

const getMediaQuery = (size: string, type: React.CSSProperties['display']) => `
  display: ${type};

  @media (min-width: ${size}) {
    display: ${type === 'none' ? 'block' : 'none'};
  }
`;

const getInputButtonStyles = (p: {
  isActive?: boolean;
  collapseIntoEllipsisMenu?: number;
}) => `
  color: ${p.isActive ? p.theme.blueLight : p.theme.gray2};
  margin-left: ${space(0.5)};
  width: 18px;

  &,
  &:hover,
  &:focus {
    background: transparent;
  }

  &:hover {
    color: ${p.theme.gray3};
  }

  ${p.collapseIntoEllipsisMenu &&
    getMediaQuery(p.theme.breakpoints[p.collapseIntoEllipsisMenu], 'none')};
`;

const getDropdownElementStyles = (p: {showBelowMediaQuery: number; last?: boolean}) => `
  padding: 0 ${space(1)} ${p.last ? null : space(0.5)};
  margin-bottom: ${p.last ? null : space(0.5)};
  display: none;
  color: ${p.theme.gray4};
  align-items: center;
  min-width: 190px;
  height: 38px;
  padding-left: ${space(1.5)};
  padding-right: ${space(1.5)};

  &,
  &:hover,
  &:focus {
    border-bottom: ${p.last ? null : `1px solid ${p.theme.gray1}`};
    border-radius: 0;
  }

  &:hover {
    color: ${p.theme.blueDark};
  }

  ${p.showBelowMediaQuery &&
    getMediaQuery(p.theme.breakpoints[p.showBelowMediaQuery], 'flex')}
`;

const SEARCH_SPECIAL_CHARS_REGEXP = new RegExp(
  `^${NEGATION_OPERATOR}|\\${SEARCH_WILDCARD}`,
  'g'
);

const FIELD_TAGS = Object.fromEntries(
  Object.keys(FIELDS).map(item => [item, {key: item, name: item}])
);

const TERM_SEPARATOR = ':';

class FieldKeyInput extends React.Component {
  static defaultProps = {
    placeholder: t('Search for events, users, tags, and everything else.'),
  };

  state = {
    busy: true,
    isOpen: false,
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.value !== this.props.value) {
      this.updateAutoCompleteMenu();
    }
  }
  searchInput = React.createRef();

  /**
   * Returns array of possible key values that substring match `query`
   *
   * e.g. ['is:', 'assigned:', 'url:', 'release:']
   *
   * TODO(): maps to smartSearchBar.getTagKeys
   */
  getKeys = query => {
    const {prepareQuery, supportedKeys} = this.props;

    // Return all if query is empty
    let tagKeys = Object.keys(supportedKeys).map(key => `${key}:`);

    if (query) {
      const preparedQuery =
        typeof prepareQuery === 'function' ? prepareQuery(query) : query;
      tagKeys = tagKeys.filter(key => key.indexOf(preparedQuery) > -1);
    }

    // If the environment feature is active and excludeEnvironment = true
    // then remove the environment key
    if (this.props.excludeEnvironment) {
      tagKeys = tagKeys.filter(key => key !== 'environment:');
    }

    return tagKeys.map(value => ({
      value,
      label: value,
    }));
  };

  // getCursorPosition = () => {
  //   if (!this.searchInput) {
  //     return -1;
  //   }
  //   return this.searchInput.selectionStart;
  // };

  updateAutoCompleteMenu = () => {
    // In category... show categories
    this.setState({
      busy: false,
      searchItems: this.getKeys(''),
    });
  };

  handleKeyDown = e => {
    if (e.key === 'Backspace' && this.props.value === '') {
      this.props.onBackspace();
    }
  };

  handleQueryChange = e => {
    const {value} = e.target;

    if (value[value.length - 1] === TERM_SEPARATOR) {
      this.props.onSelect(value);
      return;
    }

    this.props.onQueryChange(value);
  };

  handleInputFocus = open => {
    this.updateAutoCompleteMenu();
    // open();
  };

  handleDropdownClose = () => {
    this.setState({
      isOpen: false,
    });
  };

  handleDropdownOpen = () => {
    this.setState({
      isOpen: true,
    });
    this.updateAutoCompleteMenu();
  };

  handleDropdownSelect = ({value}) => {
    this.props.onSelect(value);
    this.setState(
      {
        searchItems: [],
      },
      () => {
        // this.focus();
        this.updateAutoCompleteMenu();
      }
    );
  };

  render() {
    const {active, placeholder, value, onGetRef, onBlur} = this.props;
    return (
      <ClassNames>
        {({css: cx}) => (
          <StyledDropdownAutoCompleteMenu
            shouldSelectWithTab
            defaultHighlightedIndex={-1}
            busy={this.state.busy}
            items={this.state.searchItems}
            alignMenu="left"
            hideInput
            rootClassName={cx`
              position: inherit;
              height: 100%;
            `}
            blendCorner
            isOpen={this.state.isOpen}
            onSelect={this.handleDropdownSelect}
            onOpen={this.handleDropdownOpen}
            onClose={this.handleDropdownClose}
            value={value}
          >
            {renderProps => {
              const inputProps = renderProps.getInputProps({
                type: 'text',
                tabIndex: 1,
                placeholder,
                name: 'query',
                autoComplete: 'off',
                onActorMount: onGetRef,
                onFocus: () => this.handleInputFocus(renderProps.actions.open),
                onBlur: onBlur,
                onKeyDown: this.handleKeyDown,
                onChange: this.handleQueryChange,
                disabled: this.props.disabled,
                isActive: active,
              });
              return (
                <KeyInputWrapper>
                  <InvisiblePlaceholder>{value || placeholder}</InvisiblePlaceholder>
                  <KeyInput
                    {...renderProps.getActorProps({...inputProps})}
                    value={value}
                  />
                </KeyInputWrapper>
              );
            }}
          </StyledDropdownAutoCompleteMenu>
        )}
      </ClassNames>
    );
  }
}

class FieldValueInput extends React.Component {
  state = {
    busy: true,
    isOpen: false,
    query: '',
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.value !== this.props.value) {
      this.updateAutoCompleteMenu();
    }
  }

  getValues = debounce((tag, query, callback) => {
    // Strip double quotes if there are any
    query = query.replace(/"/g, '').trim();

    this.setState({
      busy: true,
    });

    this.props.onGetTagValues(tag, query).then(
      values => {
        this.setState({
          busy: false,
          searchItems: values.map(value => {
            // Wrap in quotes if there is a space
            const quotedText = value.indexOf(' ') > -1 ? `"${value}"` : value;
            return {
              value: quotedText,
              label: quotedText,
            };
          }),
        });
      },
      () => {
        this.setState({busy: false});
      }
    );
  }, 300);

  updateAutoCompleteMenu = () => {
    // parse tag name and fetch values
    let {supportedKeys} = this.props;
    let tagName = this.props.termKey;
    let tag = supportedKeys[tagName];

    if (!tag) return undefined;

    // Ignore the environment tag if the feature is active and excludeEnvironment = true
    if (this.props.excludeEnvironment && tagName === 'environment') {
      return undefined;
    }
    let query = '';

    return this.getValues(tag, query, values => {
      console.log('values', values);
    });
  };

  handleKeyUp = e => {
    if (e.key === 'Backspace' && !this.props.value) {
      // this.props.onEditPreviousTerm();
    }
  };

  handleQueryChange = e => {
    const {value} = e.target;

    this.props.onQueryChange(e.target.value);
  };

  handleInputFocus = open => {
    this.updateAutoCompleteMenu();
    this.props.onFocus();
    // open();
  };

  handleKeyDown = e => {
    if (e.key === 'Backspace' && !this.props.value) {
      this.props.onBackspace(e);
    }
  };

  handleDropdownClose = () => {
    this.setState({
      isOpen: false,
    });
  };

  handleDropdownOpen = () => {
    this.setState({
      isOpen: true,
    });
    this.updateAutoCompleteMenu();
  };

  handleDropdownSelect = ({value}) => {
    this.props.onSelect(value);
    this.setState(
      {
        searchItems: [],
      },
      () => {
        this.updateAutoCompleteMenu();
      }
    );
  };

  render() {
    const {active, value} = this.props;
    return (
      <ClassNames>
        {({css: cx}) => (
          <StyledDropdownAutoCompleteMenu
            shouldSelectWithTab
            busy={this.state.busy}
            items={this.state.searchItems}
            alignMenu="left"
            hideInput
            rootClassName={cx`
              position: inherit;
              height: 100%;
            `}
            blendCorner
            isOpen={this.state.isOpen}
            defaultHighlightedIndex={-1}
            onSelect={this.handleDropdownSelect}
            onOpen={this.handleDropdownOpen}
            onClose={this.handleDropdownClose}
            value={value}
          >
            {renderProps => {
              const inputProps = renderProps.getInputProps({
                type: 'text',
                tabIndex: 2,
                name: 'query',
                autoComplete: 'off',
                onActorMount: this.props.onGetRef,
                onFocus: () => this.handleInputFocus(renderProps.actions.open),
                onBlur: () => {
                  console.log('renderProps value blur');
                  this.props.onBlur();
                },
                onKeyUp: this.handleKeyUp,
                onKeyDown: this.handleKeyDown,
                onChange: this.handleQueryChange,
                disabled: this.props.disabled,
              });
              return (
                <ValueInput
                  {...renderProps.getActorProps({...inputProps, isActive: active, value})}
                />
              );
            }}
          </StyledDropdownAutoCompleteMenu>
        )}
      </ClassNames>
    );
  }
}

const StyledDropdownAutoCompleteMenu = styled(DropdownAutoCompleteMenu)`
  box-shadow: ${p => p.theme.dropShadowLight};
  border: 1px solid ${p => p.theme.borderDark};
  border-radius: ${p => p.theme.borderRadiusBottom};
  position: absolute;
  /* Container has a border that we need to account for */
  right: -1px;
  left: -1px;
  background: #fff;
  z-index: ${p => p.theme.zIndex.dropdown};
  overflow: hidden;
`;

type NewTermInputProps = {
  term: TermObj;
  isEditingTerm: boolean; // TODO this is always true?
};

type NewTermInputState = {
  isEditingKey: boolean | null;
};
class NewTermInput extends React.Component<NewTermInputProps, NewTermInputState> {
  state = {
    isEditingKey: null,
  };

  static defaultProps = {
    placeholder: t('Search for events, users, tags, and everything else.'),
  };

  componentDidMount() {
    console.log('cdm', this.props.term, this.state.isEditingKey, this.props.didSelectKey);
    if (this.props.didSelectKey) {
      this.valueRef.focus();
      return;
    }

    if (!this.props.term.key && !this.props.term.value) {
      this.keyRef.focus();
      return;
    }

    if (this.state.isEditingKey === false) {
      this.keyRef.focus();
      return;
    }

    if (!this.state.isEditingKey && !this.props.term.value) {
      this.keyRef.focus();
      return;
    }

    this.valueRef.focus();
  }

  componentDidUpdate(prevProps, prevState) {
    console.log('cdu', prevState.isEditingKey, this.state.isEditingKey);

    // if (
    //   !prevProps.shouldFocusValue &&
    //   prevProps.shouldFocusValue !== this.props.shouldFocusValue &&
    //   this.valueRef
    // ) {
    //   this.valueRef.focus();
    //   return;
    // }

    if (
      this.props.term.key &&
      ((!prevProps.isEditingTerm && this.props.isEditingTerm) ||
        (prevState.isEditingKey && !this.state.isEditingKey && this.valueRef) ||
        (prevState.isEditingKey === null && this.state.isEditingKey === false))
    ) {
      console.log('valueRef focus');
      this.valueRef.focus();
    } else if (
      (!this.props.term.key &&
        !this.props.term.value &&
        (prevProps.term.key !== this.props.term.key ||
          prevProps.term.value !== this.props.term.value)) ||
      (!prevState.isEditingKey && this.state.isEditingKey)
    ) {
      console.log('keyRef focus');
      this.keyRef.focus();
    }
  }

  handleKeyQueryChange = value => {
    this.props.onTermChange({key: value, value: this.props.term.value});
  };

  handleKeyFocus = () => {
    this.setState({isEditingKey: true});
  };

  handleValueBackspace = e => {
    console.log('handle value backspace');
    this.setState({isEditingKey: true});
  };

  handleKeyBackspace = e => {
    console.log('handle key backspace');
    this.setState({isEditingKey: true});
    this.props.onEditPreviousTerm(e);
  };

  handleValueFocus = () => {
    console.log('handle value focus');
    this.setState({isEditingKey: false});
  };

  handleValueBlur = () => {
    console.log('value blur');
    this.handleSelectValue(this.props.term.value);
    // this.props.onValueBlur();
  };

  handleValueQueryChange = value => {
    this.props.onTermChange({key: this.props.term.key, value});
  };

  handleSelectKey = value => {
    this.setState({
      isEditingKey: false,
    });
    this.props.onSelectKey({key: value, value: this.props.term.value});
  };

  handleSelectValue = value => {
    if (!value || !this.props.term.key) {
      return;
    }
    this.props.onTermCompleted({
      key: this.props.term.key,
      value,
    });
    this.setState({
      isEditingKey: true,
    });
  };

  render() {
    const {term, placeholder, supportedTags, onGetTagValues, ...props} = this.props;
    return (
      <NewTermWrapper>
        <FieldKeyInput
          value={term.key}
          supportedKeys={supportedTags}
          placeholder={placeholder}
          active={this.state.isEditingKey || this.state.isEditingKey === null}
          onSelect={this.handleSelectKey}
          onGetRef={ref => (this.keyRef = ref)}
          onQueryChange={this.handleKeyQueryChange}
          onBackspace={this.handleKeyBackspace}
          onFocus={this.handleKeyFocus}
        />
        <FieldValueInput
          value={term.value}
          termKey={(term.key && term.key.slice(0, -1)) || ''}
          active={this.state.isEditingKey === false}
          supportedKeys={supportedTags}
          onGetRef={ref => (this.valueRef = ref)}
          onGetTagValues={onGetTagValues}
          onQueryChange={this.handleValueQueryChange}
          onBackspace={this.handleValueBackspace}
          onSelect={this.handleSelectValue}
          onFocus={this.handleValueFocus}
          onBlur={this.handleValueBlur}
        />
      </NewTermWrapper>
    );
  }
}
const NewTermWrapper = styled('div')`
  display: grid;
  grid-template-columns: min-content max-content;
  height: 100%;
`;

type TermProps = {
  term: TermObj;
  onTermRemove: () => void;
};
class Term extends React.Component<TermProps> {
  render() {
    const {term, onTermRemove} = this.props;
    return (
      <TermWrapper>
        <RemoveTermButton
          size="zero"
          borderless
          icon={<IconClose size="xs" />}
          label={t('Remove Term')}
          onClick={onTermRemove}
        ></RemoveTermButton>
        <div>
          <TermKey>{term.key}</TermKey>
          <TermValue>{term.value}</TermValue>
        </div>
      </TermWrapper>
    );
  }
}
const TermWrapper = styled('div')`
  display: grid;
  grid-auto-flow: column;
  grid-gap: ${space(0.25)};
  align-items: center;
  background-color: #e5ecfb;
  border: 1px solid #7199dd;
  color: #3b6ecc;
  margin: ${space(1)} 0;
  padding: 0 6px;
  border-radius: 2px;
  white-space: nowrap;
`;

const RemoveTermButton = styled(Button)`
  background-color: #e5ecfb;
  color: #3b6ecc;
`;
const TermKey = styled('span')``;
const TermValue = styled('span')``;

type TermObj = {
  key: string;
  value: string;
};
type SmartSearchBarProps = {};
type SmartSearchBarState = {
  term: TermObj;
  terms: TermObj[];
  isEditingTerm: boolean;
  didSelectKey: boolean;
};

class SmartSearchBar extends React.Component<SmartSearchBarProps, SmartSearchBarState> {
  state = {
    term: {key: '', value: ''},
    terms: [],
    isEditingTerm: false,
    didSelectKey: false,
  };

  parseTerms = query => {
    return query.split(' ');
  };

  handleClearSearch = () => {
    this.setState({
      terms: [],
      term: {key: '', value: ''},
      isEditingTerm: false,
      didSelectKey: false,
    });
  };

  handleSelectKey = term => {
    console.log('handle select key', term);
    this.setState({term, didSelectKey: true});
  };

  handleTermCompleted = term => {
    console.log('handle term completed', term);
    this.setState(state => ({
      terms: [...state.terms, term],
      term: {key: '', value: ''},
      isEditingTerm: false,
      didSelectKey: false,
    }));
  };

  handleTermRemove = index => {
    this.setState(state => {
      const terms = [...state.terms];
      terms.splice(index, 1);
      return {
        terms,
      };
    });
  };

  handleEditPreviousTerm = () => {
    const term = this.state.terms.pop();
    console.log('edit prev', term);
    if (!term) {
      return;
    }
    this.setState({
      term,
      isEditingTerm: true,
    });
  };

  handleTermChange = term => {
    this.setState({term, didSelectKey: false});
  };

  render() {
    const {
      supportedTags,
      onGetTagValues,

      className,
      dropdownClassName,
      organization,
      hasPinnedSearch,
      hasSearchBuilder,
      canCreateSavedSearch,
      pinnedSearch,
      placeholder,
      disabled,
      useFormWrapper,
      onSidebarToggle,
    } = this.props;
    const hasTerms = !!this.state.terms.length;

    return (
      <div
        className={classnames(
          {
            disabled,
          },
          className
        )}
      >
        <form
          onSubmit={e => {
            e.preventDefault();
            console.log('submit');
            this.props.onSearch(
              this.state.terms.map(({key, value}) => `${key}${value}`).join(' ')
            );
          }}
        >
          <SearchBarContainer>
            <SearchLabel htmlFor="smart-search-input" aria-label={t('Search events')}>
              <IconSearch />
            </SearchLabel>
            <TermsAndEditor>
              <CompletedTerms>
                {this.state.terms.map((term, i) => (
                  <Term
                    key={`${term.key}-${term.value}`}
                    term={term}
                    onGetTagValues={onGetTagValues}
                    supportedTags={supportedTags}
                    onTermCompleted={this.handleTermCompleted}
                    onTermRemove={() => this.handleTermRemove(i)}
                  />
                ))}
              </CompletedTerms>
              <NewTermInput
                key={`${this.state.term.key}-${this.state.term.value}`}
                term={this.state.term}
                onTermChange={this.handleTermChange}
                onGetTagValues={onGetTagValues}
                supportedTags={supportedTags}
                onTermCompleted={this.handleTermCompleted}
                onSelectKey={this.handleSelectKey}
                onEditPreviousTerm={this.handleEditPreviousTerm}
                isEditingTerm={this.state.isEditingTerm}
                didSelectKey={this.state.didSelectKey}
              />
            </TermsAndEditor>
            {this.state.query !== '' && (
              <InputButton
                type="button"
                title={t('Clear search')}
                borderless
                aria-label="Clear search"
                size="zero"
                tooltipProps={{
                  containerDisplayMode: 'inline-flex',
                }}
                onClick={this.clearSearch}
              >
                <IconClose size="xs" />
              </InputButton>
            )}
            {hasPinnedSearch && (
              <InputButton
                type="button"
                title={pinTooltip}
                borderless
                disabled={!hasQuery}
                aria-label={pinTooltip}
                size="zero"
                tooltipProps={{
                  containerDisplayMode: 'inline-flex',
                }}
                onClick={this.onTogglePinnedSearch}
                collapseIntoEllipsisMenu={1}
                isActive={!!pinnedSearch}
              >
                <InlineSvg src={pinIconSrc} />
              </InputButton>
            )}
            {canCreateSavedSearch && (
              <ClassNames>
                {({css: cx}) => (
                  <CreateSavedSearchButton
                    query={this.state.query}
                    organization={organization}
                    disabled={!hasQuery}
                    withTooltip
                    iconOnly
                    buttonClassName={cx`
                      ${getInputButtonStyles({
                        collapseIntoEllipsisMenu: 2,
                      })}
                    `}
                  />
                )}
              </ClassNames>
            )}
            {hasSearchBuilder && (
              <SearchBuilderButton
                title={t('Toggle search builder')}
                borderless
                size="zero"
                tooltipProps={{
                  containerDisplayMode: 'inline-flex',
                }}
                collapseIntoEllipsisMenu={2}
                aria-label={t('Toggle search builder')}
                onClick={onSidebarToggle}
              >
                <InlineSvg src="icon-sliders" size="13" />
              </SearchBuilderButton>
            )}

            {(hasPinnedSearch || canCreateSavedSearch || hasSearchBuilder) && (
              <StyledDropdownLink
                anchorRight
                caret={false}
                title={
                  <EllipsisButton
                    size="zero"
                    borderless
                    tooltipProps={{
                      containerDisplayMode: 'flex',
                    }}
                    type="button"
                    aria-label={t('Show more')}
                  >
                    <EllipsisIcon src="icon-ellipsis-filled" />
                  </EllipsisButton>
                }
              >
                {hasPinnedSearch && (
                  <DropdownElement
                    showBelowMediaQuery={1}
                    data-test-id="pin-icon"
                    onClick={this.onTogglePinnedSearch}
                  >
                    <MenuIcon src={pinIconSrc} size="13" />
                    {!!pinnedSearch ? 'Unpin Search' : 'Pin Search'}
                  </DropdownElement>
                )}
                {canCreateSavedSearch && (
                  <ClassNames>
                    {({css: cx}) => (
                      <CreateSavedSearchButton
                        query={this.state.query}
                        organization={organization}
                        disabled={!hasQuery}
                        buttonClassName={cx`
                          ${getDropdownElementStyles({
                            showBelowMediaQuery: 2,
                            last: false,
                          })}
                        `}
                      />
                    )}
                  </ClassNames>
                )}
                {hasSearchBuilder && (
                  <DropdownElement showBelowMediaQuery={2} last onClick={onSidebarToggle}>
                    <MenuIcon src="icon-sliders" size="12" />
                    Toggle sidebar
                  </DropdownElement>
                )}
              </StyledDropdownLink>
            )}
          </SearchBarContainer>
        </form>
      </div>
    );
  }
}

const Placeholder = styled('div')`
  display: flex;
  align-items: center;
  cursor: text;
`;
const InputButton = styled(Button)`
  ${getInputButtonStyles}
`;
const MenuIcon = styled(InlineSvg)`
  margin-right: ${space(1)};
`;
const EllipsisButton = styled(InputButton)`
  /*
   * this is necessary because DropdownLink wraps the button in an unstyled
   * span
   */
  margin: 6px 0 0 0;
`;

const EllipsisIcon = styled(InlineSvg)`
  width: 12px;
  height: 12px;
  transform: rotate(90deg);
`;

type SearchBarProps = {
  api: Client;
  organization: Organization;
  projectIds: number;
  tags: Tag[];
  query: string;
};
type SearchBarState = {
  tags: any;
};
class SearchBar extends React.PureComponent<SearchBarProps, SearchBarState> {
  state = {
    tags: {},
  };

  componentDidMount() {
    // Clear memoized data on mount to make tests more consistent.
    this.getEventFieldValues.cache.clear();
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(this.props.projectIds, prevProps.projectIds)) {
      // Clear memoized data when projects change.
      this.getEventFieldValues.cache.clear();
    }
  }

  /**
   * Returns array of tag values that substring match `query`; invokes `callback`
   * with data when ready
   */
  getEventFieldValues = memoize(
    (tag, query, endpointParams) => {
      const {api, organization, projectIds} = this.props;

      return fetchTagValues(
        api,
        organization.slug,
        tag.key,
        query,
        projectIds,
        endpointParams
      ).then(
        results =>
          flatten(results.filter(({name}) => defined(name)).map(({name}) => name)),
        () => {
          throw new Error('Unable to fetch event field values');
        }
      );
    },
    ({key}, query) => `${key}-${query}`
  );

  /**
   * Prepare query string (e.g. strip special characters like negation operator)
   */
  prepareQuery = query => query.replace(SEARCH_SPECIAL_CHARS_REGEXP, '');

  getTagList() {
    const {organization, tags} = this.props;
    const fields = organization.features.includes('transaction-events')
      ? FIELD_TAGS
      : omit(FIELD_TAGS, TRACING_FIELDS);
    const combined: {[key: string]: Tag} = assign({}, tags, fields);
    combined.has = {
      key: 'has',
      name: 'Has property',
      values: Object.keys(combined),
      predefined: true,
    };

    return combined;
  }

  render() {
    const {projectIds, api, organization, query, ...props} = this.props;
    const tags = this.getTagList();
    return (
      <ClassNames>
        {({css: cx}) => (
          <SmartSearchBar
            key={query}
            {...props}
            hasRecentSearches
            savedSearchType={SearchType.EVENT}
            onGetTagValues={this.getEventFieldValues}
            supportedTags={tags}
            prepareQuery={this.prepareQuery}
            excludeEnvironment
            dropdownClassName={cx`
              max-height: 300px;
              overflow-y: auto;
            `}
          />
        )}
      </ClassNames>
    );
  }
}

export default withApi(withTags(SearchBar));

const CompletedTerms = styled('div')`
  display: grid;
  grid-auto-flow: column;
  grid-gap: ${space(0.5)};
  font-family: Monaco;
  font-size: 12px;
`;

const InvisiblePlaceholder = styled('div')`
  opacity: 0;
  white-space: nowrap;
  padding-left: ${space(0.5)};
  padding-right: ${space(0.5)};
  font-family: Monaco;
`;
const KeyInputWrapper = styled('div')`
  display: flex;
  align-items: center;
  position: relative;
  height: 100%;
`;

const Input = styled('input')`
  flex: 1;
  border: none;

  display: block;
  height: 100%;
  width: 100%;
  min-width: 60px;
  position: relative;

  line-height: 1.42857143;
  background-color: transparent;
  background-image: none;
  box-shadow: none;
  /* -webkit-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
  -o-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
  transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; */

  &:focus {
    box-shadow: none;
  }
`;

const KeyInput = styled(Input)<{isActive?: boolean}>`
  position: absolute;
  top: 0;
  ${p =>
    p.isActive
      ? css`
          height: 100%;
        `
      : css`
          height: auto;
          margin-top: ${space(1)};
          margin-bottom: ${space(1)};
          padding-left: ${space(0.5)};
          padding-right: ${space(0.5)};
          padding-top: ${space(0.25)};
          padding-bottom: ${space(0.25)};
          border: 1px solid ${p.theme.offWhite};
          background-color: ${p.theme.offWhite};
          color: ${p.theme.gray2};
          border-radius: 2px;
          font-family: Monaco;
        `};
`;

const ValueInput = styled(Input)<{isActive?: boolean}>`
  ${p => (!p.isActive && !p.value ? 'width: 0' : 'width: 100%')};
`;

const SearchBarContainer = styled('div')`
  display: grid;
  align-items: center;
  grid-gap: ${space(1)};
  grid-template-columns: max-content auto max-content max-content;

  border: 1px solid #c9c0d1;
  border-radius: ${p => p.theme.borderRadius};
  box-shadow: inset 0 2px 0 rgba(0, 0, 0, 0.04);
  font-size: 14px;
  color: #493e54;
  position: relative;
`;

const SearchLabel = styled('label')`
  display: flex;
  align-items: center;
  margin: 0;
  padding-left: ${space(1)};
  color: ${p => p.theme.gray2};
`;

const TermsAndEditor = styled('div')`
  display: grid;
  grid-gap: ${space(0.5)};
  grid-template-columns: max-content auto;
  height: 40px;
`;
