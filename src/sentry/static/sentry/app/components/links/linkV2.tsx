import React from 'react';
import PropTypes from 'prop-types';
import {Link as RouterLink} from 'react-router';
import {Location, LocationDescriptor} from 'history';

type ToLocationFunction = (location: Location) => LocationDescriptor;

export type LinkProps = {
  // Link content (accepted via string or components / DOM nodes)
  children: React.ReactNode;
  // Optional URL
  to?: string | ToLocationFunction | LocationDescriptor;
  // Action to perform when clicked
  onClick?: (event: React.MouseEvent) => void | Promise<void>;
  // Styles applied to the component's root
  className?: string;
  // Specifies extra information about the element
  title?: string;
};

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({to = '#', ...props}, ref) => {
    if (typeof to === 'string') {
      <a href={to} ref={ref} {...props} />;
    }

    return <RouterLink to={to} {...props} />;
  }
);

Link.propTypes = {
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onClick: PropTypes.func,
};

export default Link;
