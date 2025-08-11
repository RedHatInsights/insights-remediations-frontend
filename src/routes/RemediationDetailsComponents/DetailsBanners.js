import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, AlertActionCloseButton } from '@patternfly/react-core';

const DetailsBanner = ({ status, remediationPlanName, canceledAt }) => {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  let variant = 'info';
  let title = '';
  let body = '';

  switch (status) {
    case 'running':
      title = 'The execution of the remediation plan is in progress';
      body =
        'To view the progress, check the execution log file for each system included in this remediation plan.';
      break;

    case 'success':
      variant = 'success';
      title = 'The execution of the remediation plan was successful';
      body =
        'To check the resolution status for each issue in the remediation plan, go to the respective service view, for example, Advisor recommendations.';
      break;

    case 'failure':
      variant = 'danger';
      title = 'The execution of the remediation plan failed';
      body =
        'To learn why, check the log files for the affected systems where the remediation plan failed to execute.';
      break;

    case 'canceled':
      variant = 'danger';
      title = 'The execution of the remediation plan was canceled';
      body = `The execution of the “${
        remediationPlanName ?? '-'
      }” was canceled on ${canceledAt ?? '-'}.`;
      break;

    default:
      return null;
  }

  return (
    <Alert
      isInline
      variant={variant}
      title={title}
      className="pf-v6-u-mb-md"
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
