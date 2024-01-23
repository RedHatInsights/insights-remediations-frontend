/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';

import PropTypes from 'prop-types';
import { Button, Tooltip } from '@patternfly/react-core';
import { ExecuteModal } from './Modals/ExecuteModal';
import './ExecuteButton.scss';
import './Status.scss';

const ExecuteButton = ({
  isLoading,
  isDisabled,
  disabledStateText,
  data,
  getConnectionStatus,
  remediationId,
  remediationName,
  issueCount,
  runRemediation,
  etag,
  remediationStatus,
  setEtag,
}) => {
  const [open, setOpen] = useState(false);
  const [showRefreshMessage, setShowRefreshMessage] = useState(false);

  const isEnabled = () =>
    true || localStorage.getItem('remediations:fifi:debug') === 'true';

  useEffect(() => {
    if (remediationStatus === 'changed') {
      getConnectionStatus(remediationId);
      setShowRefreshMessage(true);
    } else if (remediationStatus === 'fulfilled') {
      setOpen(false);
    }
  }, [remediationStatus]);

  const buttonWithTooltip = () => {
    return isDisabled ? (
      <Tooltip content={disabledStateText} position="auto">
        <Button isAriaDisabled>Execute playbook</Button>
      </Tooltip>
    ) : (
      <Button
        data-testid="execute-button-enabled"
        onClick={() => {
          setOpen(true);
          getConnectionStatus(remediationId);
        }}
      >
        Execute playbook
      </Button>
    );
  };

  return isEnabled() ? (
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
          remediationId={remediationId}
          remediationName={remediationName}
          data={data}
          etag={etag}
          isLoading={isLoading}
          issueCount={issueCount}
          runRemediation={runRemediation}
          setEtag={setEtag}
        />
      )}
    </React.Fragment>
  ) : null;
};

ExecuteButton.propTypes = {
  isLoading: PropTypes.bool,
  data: PropTypes.array,
  getConnectionStatus: PropTypes.func,
  runRemediation: PropTypes.func,
  remediationId: PropTypes.string,
  remediationName: PropTypes.string,
  remediationStatus: PropTypes.string,
  issueCount: PropTypes.number,
  etag: PropTypes.string,
  setEtag: PropTypes.func,
  isDisabled: PropTypes.bool,
  disabledStateText: PropTypes.string,
};

ExecuteButton.defaultProps = {
  data: [],
  isDisabled: false,
};

export default ExecuteButton;
