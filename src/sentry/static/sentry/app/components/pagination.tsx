import {browserHistory} from 'react-router';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';
import {Query} from 'history';

import {IconChevron} from 'sentry/icons';
import {t} from 'sentry/locale';
import Button from 'sentry/components/button';
import ButtonBar from 'sentry/components/buttonBar';
import parseLinkHeader from 'sentry/utils/parseLinkHeader';
import {callIfFunction} from 'sentry/utils/callIfFunction';

const defaultProps = {
  onCursor: (cursor: string, path: string, query: Query, _direction: number) => {
    browserHistory.push({
      pathname: path,
      query: {...query, cursor},
    });
  },
};

type DefaultProps = Readonly<typeof defaultProps>;

type Props = {
  className?: string;
  pageLinks: string | null | undefined;
  to?: string;
} & DefaultProps;

class Pagination extends React.Component<Props> {
  static propTypes = {
    pageLinks: PropTypes.string,
    to: PropTypes.string,
    onCursor: PropTypes.func,
    className: PropTypes.string,
  };

  static contextTypes = {
    location: PropTypes.object,
  };

  static defaultProps = defaultProps;

  render() {
    const {className, onCursor, pageLinks} = this.props;
    if (!pageLinks) {
      return null;
    }

    const location = this.context.location;
    const path = this.props.to || location.pathname;
    const query = location.query;
    const links = parseLinkHeader(pageLinks);
    const previousDisabled = links.previous.results === false;
    const nextDisabled = links.next.results === false;

    return (
      <div className={className}>
        <ButtonBar merged>
          <Button
            icon={
              <IconChevron
                direction="left"
                size="sm"
                color={previousDisabled ? 'gray400' : 'gray700'}
              />
            }
            aria-label={t('Previous')}
            disabled={previousDisabled}
            onClick={() => {
              callIfFunction(onCursor, links.previous.cursor, path, query, -1);
            }}
          />
          <Button
            icon={
              <IconChevron
                direction="right"
                size="sm"
                color={nextDisabled ? 'gray400' : 'gray700'}
              />
            }
            aria-label={t('Next')}
            disabled={nextDisabled}
            onClick={() => {
              callIfFunction(onCursor, links.next.cursor, path, query, 1);
            }}
          />
        </ButtonBar>
      </div>
    );
  }
}

export default styled(Pagination)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: 20px 0 0 0;
`;
