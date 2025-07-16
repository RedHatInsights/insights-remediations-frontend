import React, { useState } from 'react';

import PropTypes from 'prop-types';
import { Flex } from '@patternfly/react-core';
import { ExecuteModal } from './Modals/ExecuteModal';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import ButtonWithToolTip from '../Utilities/ButtonWithToolTip';

const ExecuteButton = ({
  isDisabled,
  issueCount,
  remediationStatus,
  remediation,
  refetchRemediationPlaybookRuns,
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
        data-testid="execute-button-enabled"
      >
        {isDisabled && <ExclamationTriangleIcon />} Execute
      </ButtonWithToolTip>
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
