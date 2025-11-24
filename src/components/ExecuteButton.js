import React, { useState } from 'react';

import PropTypes from 'prop-types';
import { Flex } from '@patternfly/react-core';
import { ExecuteModal } from './Modals/ExecuteModal';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import ButtonWithToolTip from '../Utilities/ButtonWithToolTip';
import { useFeatureFlag } from '../Utilities/Hooks/useFeatureFlag';
import { ExecuteModalV2 } from './Modals/ExecuteModalV2';

const ExecuteButton = ({
  isDisabled,
  issueCount,
  remediationStatus,
  remediation,
  refetchRemediationPlaybookRuns,
  detailsLoading,
}) => {
  const [open, setOpen] = useState(false);
  const isNewModalEnabled = useFeatureFlag('newModal');

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
      {open && !isNewModalEnabled && (
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
      {open && isNewModalEnabled && (
        <ExecuteModalV2
          isOpen={open}
          onClose={() => setOpen(false)}
          remediation={remediation}
          remediationStatus={remediationStatus}
          refetchRemediationPlaybookRuns={refetchRemediationPlaybookRuns}
          detailsLoading={detailsLoading}
        />
      )}
    </React.Fragment>
  );
};

ExecuteButton.propTypes = {
  remediation: PropTypes.object,
  remediationStatus: PropTypes.object,
  issueCount: PropTypes.number,
  isDisabled: PropTypes.bool,
  refetchRemediationPlaybookRuns: PropTypes.func,
  detailsLoading: PropTypes.bool,
};

export default ExecuteButton;
