import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@patternfly/react-core';

const DetailsBanner = ({ status, remediationPlanName, canceledAt }) => {
  let variant = 'info';
  let title = '';
  let description = '';

  switch (status) {
    case 'running':
      variant = 'info';
      title = 'The execution of the remediation plan is in progress.';
      description =
        'For more information you can review the log file for the individual systems that this remediation plan was executed on.';
      break;
    case 'succeded':
      variant = 'success';
      title = 'The execution of the remediation plan succeeded.';
      description =
        'Review the issue resolution status in the respective service (for example Advisor recommendations).';
      break;
    case 'failure':
      variant = 'danger';
      title = 'The execution of the remediation plan failed.';
      description =
        'For more information you can review the log file for the individual systems that this remediation plan was executed on.';
      break;
    case 'canceled':
      variant = 'danger';
      title = 'The execution of the remediation plan was canceled.';
      description = `The execution of the remediation plan ${
        remediationPlanName || '[RemediationPlanName]'
      } was canceled on ${canceledAt}.`;
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
      //TODO: UX has removed actions until after summit
      // actionLinks={
      //   <Flex>
      //     <AlertActionLink component="a" href="#">
      //       View details
      //     </AlertActionLink>
      //     <AlertActionLink onClick={() => console.log('Clicked on Ignore')}>
      //       Ignore
      //     </AlertActionLink>
      //   </Flex>
      // }
    >
      <p>{description}</p>
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
