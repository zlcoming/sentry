import PropTypes from 'prop-types';
import React from 'react';

import {t} from 'sentry/locale';
import RelativeSelector from 'sentry/components/organizations/timeRangeSelector/dateRange/relativeSelector';
import SelectorItem from 'sentry/components/organizations/timeRangeSelector/dateRange/selectorItem';

const SelectorItems = ({
  shouldShowRelative,
  shouldShowAbsolute,
  handleSelectRelative,
  handleAbsoluteClick,
  relativeSelected,
  isAbsoluteSelected,
}) => (
  <React.Fragment>
    {shouldShowRelative && (
      <RelativeSelector onClick={handleSelectRelative} selected={relativeSelected} />
    )}
    {shouldShowAbsolute && (
      <SelectorItem
        onClick={handleAbsoluteClick}
        value="absolute"
        label={t('Absolute date')}
        selected={isAbsoluteSelected}
        last
      />
    )}
  </React.Fragment>
);

SelectorItems.propTypes = {
  shouldShowRelative: PropTypes.bool,
  shouldShowAbsolute: PropTypes.bool,
  handleSelectRelative: PropTypes.func,
  handleAbsoluteClick: PropTypes.func,
  relativeSelected: PropTypes.string,
  isAbsoluteSelected: PropTypes.bool,
};

export default SelectorItems;
