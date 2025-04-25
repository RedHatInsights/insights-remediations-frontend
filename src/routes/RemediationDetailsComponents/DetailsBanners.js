import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, AlertActionCloseButton } from '@patternfly/react-core';

//Execution History Tab
const DetailsBanner = ({ status, remediationPlanName, canceledAt }) => {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  let variant = 'info';
  let title = '';
  let body = '';

  switch (status) {
    case 'running':
      title = 'The execution of the remediation plan is in progress.';
      body =
        'You can review the log file for each individual system while it runs.';
      break;

    case 'success':
      variant = 'success';
      title = 'The execution of the remediation plan succeeded.';
      body =
        'Review the issue-resolution status in the respective service (for example Advisor recommendations).';
      break;

    case 'failure':
      variant = 'danger';
      title = 'The execution of the remediation plan failed.';
      body = 'Review the individual system logs for more information.';
      break;

    case 'canceled':
      variant = 'danger';
      title = 'The execution of the remediation plan was canceled.';
      body = `The plan “${remediationPlanName ?? '-'}” was canceled on ${
        canceledAt ?? '-'
      }.`;
      break;

    default:
      return null;
  }

  return (
    <Alert
      isInline
      variant={variant}
      title={title}
      className="pf-v5-u-mb-md"
      actionClose={
        <AlertActionCloseButton
          title="Close alert"
          onClose={() => setOpen(false)}
        />
      }
    >
      {body}
    </Alert>
  );
};

DetailsBanner.propTypes = {
  status: PropTypes.oneOf(['running', 'succeeded', 'failed', 'canceled'])
    .isRequired,
  remediationPlanName: PropTypes.string,
  canceledAt: PropTypes.string,
};

export default DetailsBanner;
