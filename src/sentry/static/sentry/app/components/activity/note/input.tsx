import {MentionsInput, Mention, MentionItem} from 'react-mentions';
import React from 'react';
import styled from '@emotion/styled';

import {Note} from 'app/types';
import {t} from 'app/locale';
import Button from 'app/components/button';
import ConfigStore from 'app/stores/configStore';
import NavTabs from 'app/components/navTabs';
import {IconMarkdown} from 'app/icons';
import marked from 'app/utils/marked';
import space from 'app/styles/space';
import textStyles from 'app/styles/text';

import Mentionables from './mentionables';
import mentionStyle from './mentionStyle';

const defaultProps = {
  placeholder: t('Add a comment.\nTag users with @, or teams with #'),
  minHeight: 140,
  busy: false,
};

type Mention = [React.ReactText, string];

type State = {
  preview: boolean;
  value: string;
  memberMentions: Mention[];
  teamMentions: Mention[];
};

type NoteInputProps = {
  teams: MentionItem[];
  memberList: MentionItem[];

  /**
   * This is the id of the note object from the server
   * This is to indicate you are editing an existing item
   */
  modelId: string;

  /**
   * The note text itself
   */
  text: string;

  /**
   * Error?
   */
  error: boolean;

  /**
   * Error object
   */
  errorJSON: {
    detail: {
      message: string;
      code: number;
      extra: any;
    };
  };

  /**
   * Input placeholder text
   */
  placeholder: string;

  /**
   * Is input busy
   */
  busy: boolean;

  /**
   * minimum height of the textarea
   */
  minHeight: number;

  onEditFinish: () => void;
  onUpdate: (note: Note) => void;
  onCreate: (note: Note) => void;
  onChange: (e: {target: {value: string}}, {updating: boolean}) => void;
} & typeof defaultProps;

class NoteInput extends React.Component<NoteInputProps, State> {
  static defaultProps = defaultProps;

  state = {
    preview: false,
    value: this.props.text || '',
    memberMentions: [],
    teamMentions: [],
  };

  cleanMarkdown(text: string) {
    return text
      .replace(/\[sentry\.strip:member\]/g, '@')
      .replace(/\[sentry\.strip:team\]/g, '');
  }

  submitForm = () => {
    if (!!this.props.modelId) {
      this.update();
    } else {
      this.create();
    }
  };

  create = () => {
    const {onCreate} = this.props;

    if (onCreate) {
      onCreate({
        text: this.cleanMarkdown(this.state.value),
        mentions: this.finalizeMentions(),
      });
    }
  };

  update = () => {
    const {onUpdate} = this.props;

    if (onUpdate) {
      onUpdate({
        text: this.cleanMarkdown(this.state.value),
        mentions: this.finalizeMentions(),
      });
    }
  };

  finish = () => {
    this.props.onEditFinish && this.props.onEditFinish();
  };

  finalizeMentions = () => {
    const {memberMentions, teamMentions} = this.state;

    // each mention looks like [id, display]
    return [...memberMentions, ...teamMentions]
      .filter(mention => this.state.value.indexOf(mention[1]) !== -1)
      .map(mention => mention[0]);
  };

  handleToggleEdit = () => {
    this.setState({preview: false});
  };

  handleTogglePreview = () => {
    this.setState({preview: true});
  };

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.submitForm();
  };

  handleChange = (e: {target: {value: string}}) => {
    this.setState({value: e.target.value});

    if (this.props.onChange) {
      this.props.onChange(e, {updating: !!this.props.modelId});
    }
  };

  handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement> | React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Auto submit the form on [meta] + Enter
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      this.submitForm();
    }
  };

  handleCancel = (e: React.MouseEvent<Element>) => {
    e.preventDefault();
    this.finish();
  };

  handleAddMember = (id: React.ReactText, display: string) => {
    this.setState(({memberMentions}) => ({
      memberMentions: [...memberMentions, [id, display]],
    }));
  };

  handleAddTeam = (id: React.ReactText, display: string) => {
    this.setState(({teamMentions}) => ({
      teamMentions: [...teamMentions, [id, display]],
    }));
  };

  render() {
    const {preview, value} = this.state;
    const {
      modelId,
      busy,
      error,
      placeholder,
      minHeight,
      errorJSON,
      memberList,
      teams,
    } = this.props;

    const existingItem = !!modelId;
    const btnText = existingItem ? t('Save Comment') : t('Post Comment');

    const errorMessage =
      (errorJSON &&
        (typeof errorJSON.detail === 'string'
          ? errorJSON.detail
          : (errorJSON.detail && errorJSON.detail.message) ||
            t('Unable to post comment'))) ||
      null;

    return (
      <NoteInputForm
        data-test-id="note-input-form"
        noValidate
        error={error}
        onSubmit={this.handleSubmit}
      >
        <NoteInputNavTabs>
          <NoteInputNavTab className={!preview ? 'active' : ''}>
            <NoteInputNavTabLink onClick={this.handleToggleEdit}>
              {existingItem ? t('Edit') : t('Write')}
            </NoteInputNavTabLink>
          </NoteInputNavTab>
          <NoteInputNavTab className={preview ? 'active' : ''}>
            <NoteInputNavTabLink onClick={this.handleTogglePreview}>
              {t('Preview')}
            </NoteInputNavTabLink>
          </NoteInputNavTab>
          <MarkdownTab>
            <IconMarkdown />
            <MarkdownSupported>{t('Markdown supported')}</MarkdownSupported>
          </MarkdownTab>
        </NoteInputNavTabs>

        <NoteInputBody>
          {preview ? (
            <NotePreview
              minHeight={minHeight}
              dangerouslySetInnerHTML={{__html: marked(this.cleanMarkdown(value))}}
            />
          ) : (
            <MentionsInput
              style={mentionStyle({minHeight})}
              placeholder={placeholder}
              onChange={this.handleChange}
              onKeyDown={this.handleKeyDown}
              value={value}
              required
              autoFocus
            >
              <Mention
                trigger="@"
                data={memberList}
                onAdd={this.handleAddMember}
                displayTransform={(_id, display) => `@${display}`}
                markup="**[sentry.strip:member]__display__**"
                appendSpaceOnAdd
              />
              <Mention
                trigger="#"
                data={teams}
                onAdd={this.handleAddTeam}
                markup="**[sentry.strip:team]__display__**"
                appendSpaceOnAdd
              />
            </MentionsInput>
          )}
        </NoteInputBody>

        <Footer>
          <div>{errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}</div>
          <div>
            {existingItem && (
              <FooterButton priority="danger" type="button" onClick={this.handleCancel}>
                {t('Cancel')}
              </FooterButton>
            )}
            <FooterButton error={!!errorMessage} type="submit" disabled={busy}>
              {btnText}
            </FooterButton>
          </div>
        </Footer>
      </NoteInputForm>
    );
  }
}

type NoteInputContainerProps = {
  projectSlugs: string[];
  members: Mention[];
} & Exclude<NoteInputProps, 'memberList' | 'teams'>;

export default function NoteInputContainer({
  projectSlugs,
  ...props
}: NoteInputContainerProps) {
  const me = ConfigStore.get('user');

  return (
    <Mentionables me={me} projectSlugs={projectSlugs}>
      {({members, teams}) => <NoteInput memberList={members} teams={teams} {...props} />}
    </Mentionables>
  );
}

// This styles both the note preview and the note editor input
const getNotePreviewCss = p => {
  const {minHeight, padding, overflow, border} = mentionStyle(p)['&multiLine'].input;

  return `
  max-height: 1000px;
  max-width: 100%;
  ${(minHeight && `min-height: ${minHeight}px`) || ''};
  padding: ${padding};
  overflow: ${overflow};
  border: ${border};
`;
};

const getNoteInputErrorStyles = p => {
  if (!p.error) {
    return '';
  }

  return `
  color: ${p.theme.error};
  margin: -1px;
  border: 1px solid ${p.theme.error};
  border-radius: ${p.theme.borderRadius};

    &:before {
      display: block;
      content: '';
      width: 0;
      height: 0;
      border-top: 7px solid transparent;
      border-bottom: 7px solid transparent;
      border-right: 7px solid ${p.theme.red400};
      position: absolute;
      left: -7px;
      top: 12px;
    }

    &:after {
      display: block;
      content: '';
      width: 0;
      height: 0;
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-right: 6px solid #fff;
      position: absolute;
      left: -5px;
      top: 12px;
    }
  `;
};

const NoteInputForm = styled('form')<{error: boolean}>`
  font-size: 15px;
  line-height: 22px;
  transition: padding 0.2s ease-in-out;

  ${getNoteInputErrorStyles}
`;

const NoteInputBody = styled('div')`
  ${textStyles}
`;

const Footer = styled('div')`
  display: flex;
  border-top: 1px solid ${p => p.theme.borderLight};
  justify-content: space-between;
  transition: opacity 0.2s ease-in-out;
  padding-left: ${space(1.5)};
`;

const FooterButton = styled(Button)<{error?: boolean}>`
  font-size: 13px;
  margin: -1px -1px -1px;
  border-radius: 0 0 ${p => p.theme.borderRadius};

  ${p =>
    p.error &&
    `
  &, &:active, &:focus, &:hover {
  border-bottom-color: ${p.theme.error};
  border-right-color: ${p.theme.error};
  }
  `}
`;

const ErrorMessage = styled('span')`
  display: flex;
  align-items: center;
  height: 100%;
  color: ${p => p.theme.error};
  font-size: 0.9em;
`;

const NoteInputNavTabs = styled(NavTabs)`
  padding: ${space(1)} ${space(2)} 0;
  border-bottom: 1px solid ${p => p.theme.borderLight};
  margin-bottom: 0;
`;

const NoteInputNavTab = styled('li')`
  margin-right: 13px;
`;

const NoteInputNavTabLink = styled('a')`
  .nav-tabs > li > & {
    font-size: 15px;
    padding-bottom: 5px;
  }
`;
const MarkdownTab = styled(NoteInputNavTab)`
  .nav-tabs > & {
    display: flex;
    align-items: center;
    margin-right: 0;
    color: ${p => p.theme.gray600};

    float: right;
  }
`;

const MarkdownSupported = styled('span')`
  margin-left: ${space(0.5)};
  font-size: 14px;
`;

const NotePreview = styled('div')<{minHeight: number}>`
  ${getNotePreviewCss};
  padding-bottom: ${space(1)};
`;
