import {
  Button,
  Flex,
  FlexItem,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import React, { useCallback } from 'react';
import { ExecutePlaybookButton } from '../../containers/ExecuteButtons';
import { downloadPlaybook } from '../../api';
import { dispatchNotification } from '../../Utilities/dispatcher';
import RemediationDetailsDropdown from '../../components/RemediationDetailsDropdown';
import PropTypes from 'prop-types';

const RemediationDetailsPageHeader = ({
  remediation,
  remediationStatus,
  isFedramp,
  allRemediations,
  refetchAllRemediations,
  updateRemPlan,
  refetch,
  permissions,
  isExecutable,
}) => {
  const handleDownload = useCallback(async () => {
    dispatchNotification({
      title: 'Preparing playbook for download…',
      variant: 'info',
      dismissable: true,
      autoDismiss: true,
    });

    try {
      await downloadPlaybook(remediation.id);
      dispatchNotification({
        title: 'Download ready',
        description: 'Your playbook is downloading now.',
        variant: 'success',
        dismissable: true,
        autoDismiss: true,
      });
    } catch (err) {
      dispatchNotification({
        title: 'Download failed',
        description:
          err?.message || 'There was an error preparing your download.',
        variant: 'danger',
        dismissable: true,
        autoDismiss: true,
      });
    }
  }, [remediation.id]);

  return (
    <PageHeader>
      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
        <FlexItem style={{ width: '60%' }}>
          <PageHeaderTitle title={remediation.name} className="pf-v5-u-mb-md" />
          <p>{`ID: ${remediation.id}`}</p>
        </FlexItem>

        <FlexItem>
          <Split hasGutter>
            <SplitItem>
              <ExecutePlaybookButton
                isDisabled={
                  remediationStatus.connectedSystems === 0 ||
                  !permissions?.execute ||
                  !isExecutable ||
                  isFedramp
                }
                connectedSystems={remediationStatus.connectedSystems}
                totalSystems={remediationStatus.totalSystems}
                areDetailsLoading={remediationStatus.areDetailsLoading}
                detailsError={remediationStatus.detailsError}
                permissions={permissions.execute}
                issueCount={remediation?.issues}
                remediation={remediation}
              ></ExecutePlaybookButton>
            </SplitItem>
            <SplitItem>
              <Button
                isDisabled={!remediation?.issues.length}
                variant="secondary"
                onClick={handleDownload}
              >
                Download
              </Button>
            </SplitItem>
            <SplitItem>
              <RemediationDetailsDropdown
                remediation={remediation}
                remediationsList={allRemediations}
                refetchAllRemediations={refetchAllRemediations}
                updateRemPlan={updateRemPlan}
                refetch={refetch}
              />
            </SplitItem>
          </Split>
        </FlexItem>
      </Flex>
    </PageHeader>
  );
};
RemediationDetailsPageHeader.propTypes = {
  remediation: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    issues: PropTypes.array,
  }).isRequired,
  remediationStatus: PropTypes.shape({
    connectedSystems: PropTypes.number.isRequired,
    totalSystems: PropTypes.number.isRequired,
    areDetailsLoading: PropTypes.bool.isRequired,
    detailsError: PropTypes.any,
  }).isRequired,
  isFedramp: PropTypes.bool,
  allRemediations: PropTypes.shape({
    data: PropTypes.array.isRequired,
  }).isRequired,
  updateRemPlan: PropTypes.func,
  refetch: PropTypes.func,
  permissions: PropTypes.obj,
  isExecutable: PropTypes.any,
  refetchAllRemediations: PropTypes.func,
};

export default RemediationDetailsPageHeader;
