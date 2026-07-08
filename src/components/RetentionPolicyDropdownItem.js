import React from 'react';
import PropTypes from 'prop-types';
import { DropdownItem } from '@patternfly/react-core';

export const ORG_ADMIN_TOOLTIP_TEXT =
  'Requires Organization Administrator privileges.';

const RetentionPolicyDropdownItem = ({
  canManageRetentionPolicy,
  isLoading = false,
  onClick,
}) => {
  const isUnauthorized = !canManageRetentionPolicy && !isLoading;
  const handleClick =
    canManageRetentionPolicy && !isLoading ? onClick : undefined;

  return (
    <DropdownItem
      onClick={handleClick}
      isDisabled={isLoading}
      isAriaDisabled={isUnauthorized}
      tooltipProps={
        isUnauthorized ? { content: ORG_ADMIN_TOOLTIP_TEXT } : undefined
      }
    >
      Edit retention policy
    </DropdownItem>
  );
};

RetentionPolicyDropdownItem.propTypes = {
  canManageRetentionPolicy: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

export default RetentionPolicyDropdownItem;
