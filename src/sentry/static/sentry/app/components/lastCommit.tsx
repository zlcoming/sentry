import PropTypes from 'prop-types';
import React from 'react';

import {AvatarUser, Commit} from 'sentry/types';
import UserAvatar from 'sentry/components/avatar/userAvatar';
import TimeSince from 'sentry/components/timeSince';
import {t} from 'sentry/locale';

type Props = {
  commit: Commit;
  headerClass: string;
};

const unknownUser: AvatarUser = {
  id: '',
  name: '',
  username: '??',
  email: '',
  avatarUrl: '',
  avatar: {
    avatarUuid: '',
    avatarType: 'letter_avatar',
  },
  ip_address: '',
};

class LastCommit extends React.Component<Props> {
  static propTypes = {
    commit: PropTypes.object.isRequired,
    headerClass: PropTypes.string,
  };

  renderMessage(message: string): string {
    if (!message) {
      return t('No message provided');
    }

    const firstLine = message.split(/\n/)[0];
    if (firstLine.length > 100) {
      let truncated = firstLine.substr(0, 90);
      const words = truncated.split(/ /);
      // try to not have elipsis mid-word
      if (words.length > 1) {
        words.pop();
        truncated = words.join(' ');
      }
      return truncated + '...';
    }
    return firstLine;
  }

  render() {
    const {commit, headerClass} = this.props;
    const commitAuthor = commit && commit.author;
    return (
      <div>
        <h6 className={headerClass}>Last commit</h6>
        <div className="commit">
          <div className="commit-avatar">
            <UserAvatar user={commitAuthor || unknownUser} />
          </div>
          <div className="commit-message truncate">
            {this.renderMessage(commit.message)}
          </div>
          <div className="commit-meta">
            <strong>{(commitAuthor && commitAuthor.name) || t('Unknown Author')}</strong>
            &nbsp;
            <TimeSince date={commit.dateCreated} />
          </div>
        </div>
      </div>
    );
  }
}

export default LastCommit;
