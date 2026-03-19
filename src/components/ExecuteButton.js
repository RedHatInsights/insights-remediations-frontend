import React, { useState } from 'react';

import PropTypes from 'prop-types';
import { Flex } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import ButtonWithToolTip from '../Utilities/ButtonWithToolTip';
import { ExecuteModalV2 } from './Modals/ExecuteModalV2';

const ExecuteButton = ({
  isDisabled,
  remediationStatus,
  remediation,
  refetchRemediationPlaybookRuns,
  detailsLoading,
  onNavigateToExecutionHistory,
  remediationPlaybookRuns,
  isPlaybookRunsLoading,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <ButtonWithToolTip
        isDisabled={isDisabled}
        variant="primary"
        onClick={() => setOpen(true)}
        tooltipContent={
          <Flex
            className="pf-v6-u-ml-md"
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
        data-testid="execute-button-enabled"
      >
        {isDisabled && <ExclamationTriangleIcon />} Execute
      </ButtonWithToolTip>
      {open && (
        <ExecuteModalV2
          isOpen={open}
          onClose={() => setOpen(false)}
          remediation={remediation}
          remediationStatus={remediationStatus}
          refetchRemediationPlaybookRuns={refetchRemediationPlaybookRuns}
          detailsLoading={detailsLoading}
          onNavigateToExecutionHistory={onNavigateToExecutionHistory}
          remediationPlaybookRuns={remediationPlaybookRuns}
          isPlaybookRunsLoading={isPlaybookRunsLoading}
        />
      )}
    </React.Fragment>
  );
};

ExecuteButton.propTypes = {
  remediation: PropTypes.object,
  remediationStatus: PropTypes.object,
  isDisabled: PropTypes.bool,
  refetchRemediationPlaybookRuns: PropTypes.func,
  detailsLoading: PropTypes.bool,
  onNavigateToExecutionHistory: PropTypes.func,
  remediationPlaybookRuns: PropTypes.object,
  isPlaybookRunsLoading: PropTypes.bool,
};

export default ExecuteButton;
