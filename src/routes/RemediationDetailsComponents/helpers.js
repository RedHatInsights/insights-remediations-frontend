import { Flex, Icon, Popover, Spinner } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@patternfly/react-icons';
import React from 'react';

export const execStatus = (status, date) => {
  let icon;
  let displayValue = 'N/A';

  if (!date || !status) {
    return (
      <Flex spaceItems={{ default: 'spaceItemsSm' }} data-testid="flex">
        <div data-testid="text-content">{displayValue}</div>
      </Flex>
    );
  }

  if (status === 'success') {
    ((icon = (
      <Icon status="success" data-testid="icon">
        <CheckCircleIcon />
      </Icon>
    )),
      (displayValue = 'Succeeded'));
  } else if (status === 'running') {
    ((icon = <Spinner size="sm" data-testid="spinner" />),
      (displayValue = 'In progress'));
  } else if (status === 'failure') {
    ((icon = (
      <Icon status="danger" data-testid="icon">
        <ExclamationCircleIcon />
      </Icon>
    )),
      (displayValue = 'Failed'));
  }
  return (
    <Flex spaceItems={{ default: 'spaceItemsSm' }} data-testid="flex">
      {icon}
      <span data-testid="text-content">{`${displayValue} ${getTimeAgo(date)}`}</span>
    </Flex>
  );
};

export const getTimeAgo = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return '';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }
  //If less than 30 days, report days, if less than 12 months report months, then years
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
  }
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
};

// eslint-disable-next-line react/display-name
export const renderComponent = (Component, props) => (_data, _id, entity) => (
  <Component {...entity} {...props} />
);

// Execution limits constants
export const MAX_SYSTEMS = 100;
export const MAX_ACTIONS = 1000;

const ACTION_POINTS_BREAKDOWN =
  'Action points (pts) per issue type: Advisor: 20 pts, Vulnerability: 20 pts, Patch: 2 pts, and Compliance: 5 pts';

export const EXECUTION_LIMITS_DESCRIPTION = `To execute a remediation plan using Red Hat Lightspeed, the plan must be limited to no more than ${MAX_SYSTEMS} systems and ${MAX_ACTIONS} action points. ${ACTION_POINTS_BREAKDOWN}.`;

export const EXECUTION_LIMITS_HEADER_DESCRIPTION = `Execution limits: ${MAX_SYSTEMS} systems and ${MAX_ACTIONS} action points. ${ACTION_POINTS_BREAKDOWN}`;

/**
 * Calculate execution limits status
 *  @param   {object} details      - Remediation details object
 *  @param   {number} actionPoints - Total action points
 *  @returns {object}              Object containing limit status and counts
 */
export const calculateExecutionLimits = (details, actionPoints) => {
  const systemCount = details?.system_count || 0;
  const exceedsSystemsLimit = systemCount > MAX_SYSTEMS;
  const exceedsActionsLimit = actionPoints > MAX_ACTIONS;
  const exceedsExecutionLimits = exceedsSystemsLimit || exceedsActionsLimit;
  const systemsToRemove = exceedsSystemsLimit ? systemCount - MAX_SYSTEMS : 0;
  const actionsToRemove = exceedsActionsLimit ? actionPoints - MAX_ACTIONS : 0;
  return {
    exceedsSystemsLimit,
    exceedsActionsLimit,
    exceedsExecutionLimits,
    systemsToRemove,
    actionsToRemove,
  };
};

/**
 * Generate execution limits message
 *  @param   {object} limits - Result from calculateExecutionLimits
 *  @returns {string}        Formatted message
 */
export const getExecutionLimitsMessage = (limits) => {
  const {
    exceedsExecutionLimits,
    exceedsSystemsLimit,
    exceedsActionsLimit,
    systemsToRemove,
    actionsToRemove,
  } = limits;

  if (!exceedsExecutionLimits) {
    return 'Within limits of 100 systems and 1000 action points.';
  }

  let message = `Exceeds limits of ${MAX_SYSTEMS} systems and ${MAX_ACTIONS} action points. To execute in Red Hat Lightspeed remove `;

  if (exceedsSystemsLimit && exceedsActionsLimit) {
    message += `${systemsToRemove} or more systems, as well as ${actionsToRemove} or more action points from the plan.`;
  } else if (exceedsSystemsLimit) {
    message += `${systemsToRemove} or more systems from the plan.`;
  } else if (exceedsActionsLimit) {
    message += `${actionsToRemove} or more action points from the plan.`;
  }

  return message;
};

/**
 * Generate simple execution limits message for popover
 *  @param   {object} limits - Result from calculateExecutionLimits
 *  @returns {string}        Simple message: "Within limits" or "Exceeds limits"
 */
export const getExecutionLimitsPopoverMessage = (limits) => {
  const { exceedsExecutionLimits } = limits;

  return exceedsExecutionLimits ? 'Exceeds limits' : 'Within limits';
};

/**
 * Calculate error count for remediation readiness
 *  @param   {object}  params                        - Parameters object
 *  @param   {boolean} params.hasExecutePermission   - Whether user has execute permission
 *  @param   {object}  params.connectionError        - Connection error object (403/503 status blocks execution)
 *  @param   {number}  params.connectedSystems       - Number of connected systems
 *  @param   {boolean} params.exceedsExecutionLimits - Whether execution limits are exceeded
 *  @returns {number}                                Total error count
 */
export const calculateReadinessErrorCount = ({
  hasExecutePermission,
  connectionError,
  connectedSystems,
  exceedsExecutionLimits,
}) => {
  let count = 0;
  if (!hasExecutePermission) count++;
  const error = connectionError?.errors?.[0];
  if (
    error?.status === 403 ||
    error?.status === 503 ||
    error?.code === 'DEPENDENCY_UNAVAILABLE'
  )
    count++;
  if (connectedSystems === 0) count++;
  if (exceedsExecutionLimits) count++;
  return count;
};

/**
 * Render a step title with popover functionality
 *  @param   {string}          stepId         - Unique identifier for the step
 *  @param   {string}          title          - Title text to display
 *  @param   {React.ReactNode} popoverContent - Content to display in popover
 *  @param   {object}          popoverState   - Popover state object with openPopover and setOpenPopover
 *  @param   {boolean}         isError        - Whether to show error styling
 *  @returns {React.ReactNode}                Rendered step title with popover
 */
export const renderStepTitleWithPopover = (
  stepId,
  title,
  popoverContent,
  popoverState,
  isError = false,
) => {
  const { openPopover, setOpenPopover } = popoverState;

  return (
    <Popover
      isVisible={openPopover === stepId}
      shouldClose={() => setOpenPopover(null)}
      position="top"
      bodyContent={popoverContent}
      aria-label={`${title} popover`}
      maxWidth="450px"
    >
      <button
        onClick={() => setOpenPopover(openPopover === stepId ? null : stepId)}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          textDecoration: 'underline',
          textDecorationStyle: 'dotted',
          textUnderlineOffset: '2px',
          color: isError ? 'var(--pf-v6-global--danger-color--100)' : 'inherit',
          font: 'inherit',
          fontWeight: 'inherit',
        }}
      >
        {title}
      </button>
    </Popover>
  );
};
