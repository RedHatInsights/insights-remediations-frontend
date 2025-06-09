/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';

import PropTypes from 'prop-types';
import { Button, Flex, Tooltip } from '@patternfly/react-core';
import { ExecuteModal } from './Modals/ExecuteModal';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';

const ExecuteButton = ({
  isLoading,
  isDisabled,
  data,
  getConnectionStatus,
  issueCount,
  etag,
  remediationStatus,
  setEtag,
  remediation,
  refetchRemediationPlaybookRuns,
}) => {
  const [open, setOpen] = useState(false);
  const [showRefreshMessage, setShowRefreshMessage] = useState(false);
  const isEnabled = () =>
    true || localStorage.getItem('remediations:fifi:debug') === 'true';

  useEffect(() => {
    if (remediationStatus === 'changed') {
      getConnectionStatus(remediation.id);
      setShowRefreshMessage(true);
    } else if (remediationStatus === 'fulfilled') {
      setOpen(false);
    }
  }, [remediationStatus]);

  const buttonWithTooltip = () => {
    const button = (
      <Button
        isAriaDisabled={isDisabled}
        data-testid="execute-button-enabled"
        onClick={() => {
          setOpen(true);
          getConnectionStatus(remediation.id);
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
    isEnabled() && (
      <React.Fragment>
        {buttonWithTooltip()}
        {open && (
          <ExecuteModal
            isOpen={open}
            onClose={() => {
              setShowRefreshMessage(false);
              setOpen(false);
            }}
            showRefresh={showRefreshMessage}
            remediationId={remediation.id}
            remediationName={remediation.name}
            data={data}
            etag={etag}
            isLoading={isLoading}
            issueCount={issueCount}
            setEtag={setEtag}
            refetchRemediationPlaybookRuns={refetchRemediationPlaybookRuns}
          />
        )}
      </React.Fragment>
    )
  );
};

ExecuteButton.propTypes = {
  isLoading: PropTypes.bool,
  data: PropTypes.array,
  getConnectionStatus: PropTypes.func,
  remediation: PropTypes.string,
  remediationStatus: PropTypes.string,
  issueCount: PropTypes.number,
  etag: PropTypes.string,
  setEtag: PropTypes.func,
  isDisabled: PropTypes.bool,
  disabledStateText: PropTypes.string,
  connectedSystems: PropTypes.number,
  areDetailsLoading: PropTypes.bool,
  detailsError: PropTypes.any,
  permissions: PropTypes.bool,
  totalSystems: PropTypes.number,
  refetchRemediationPlaybookRuns: PropTypes.func,
};

ExecuteButton.defaultProps = {
  data: [],
  isDisabled: false,
};

export default ExecuteButton;
