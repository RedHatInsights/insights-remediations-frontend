import React, { useState } from 'react';

import PropTypes from 'prop-types';
import { Button, Flex, Tooltip } from '@patternfly/react-core';
import { ExecuteModal } from './Modals/ExecuteModal';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';

const ExecuteButton = ({
  isDisabled,
  issueCount,
  remediationStatus,
  remediation,
  refetchRemediationPlaybookRuns,
}) => {
  const [open, setOpen] = useState(false);

  const buttonWithTooltip = () => {
    const button = (
      <Button
        isAriaDisabled={isDisabled}
        data-testid="execute-button-enabled"
        onClick={() => {
          setOpen(true);
        }}
      >
        {isDisabled && <ExclamationTriangleIcon />} Execute
      </Button>
    );

    return isDisabled ? (
      <Tooltip
        minWidth="400px"
        aria-label="details Tooltip"
        content={
          <Flex
            className="pf-v5-u-ml-md"
            direction={{ default: 'column' }}
            spaceItems={{ default: 'spaceItemsNone' }}
            alignItems={{ default: 'alignItemsFlexStart' }}
          >
            <p>
              The remediation plan cannot be executed. Review the plan details
              and
              <strong> Execution readiness </strong>information.
            </p>
          </Flex>
        }
      >
        {button}
      </Tooltip>
    ) : (
      button
    );
  };

  return (
    <React.Fragment>
      {buttonWithTooltip()}
      {open && (
        <ExecuteModal
          isOpen={open}
          onClose={() => {
            setOpen(false);
          }}
          remediation={remediation}
          remediationStatus={remediationStatus}
          issueCount={issueCount}
          refetchRemediationPlaybookRuns={refetchRemediationPlaybookRuns}
        />
      )}
    </React.Fragment>
  );
};

ExecuteButton.propTypes = {
  remediation: PropTypes.string,
  remediationStatus: PropTypes.string,
  issueCount: PropTypes.number,
  isDisabled: PropTypes.bool,
  refetchRemediationPlaybookRuns: PropTypes.func,
};

export default ExecuteButton;
