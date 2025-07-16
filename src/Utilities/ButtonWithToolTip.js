import React from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip } from '@patternfly/react-core';

const ButtonWithToolTip = ({
  isDisabled,
  onClick,
  tooltipContent,
  children,
  variant = 'secondary',
  ...buttonProps
}) => {
  const button = (
    <Button
      isAriaDisabled={isDisabled}
      variant={variant}
      onClick={onClick}
      {...buttonProps}
    >
      {children}
    </Button>
  );

  return isDisabled ? (
    <Tooltip content={tooltipContent}>{button}</Tooltip>
  ) : (
    button
  );
};

ButtonWithToolTip.propTypes = {
  isDisabled: PropTypes.bool,
  onClick: PropTypes.func,
  tooltipContent: PropTypes.node,
  children: PropTypes.node.isRequired,
  variant: PropTypes.string,
};

export default ButtonWithToolTip;
