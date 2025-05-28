import { Button, Flex, FlexItem } from '@patternfly/react-core';
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
  refetchRemediationPlaybookRuns,
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
      <Flex
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        alignItems={{ default: 'alignItemsFlexStart' }}
        flexWrap={{ default: 'wrap' }}
      >
        <FlexItem grow={{ default: 'grow' }} style={{ minWidth: 0 }}>
          <PageHeaderTitle
            className="pf-v5-u-mb-sm"
            title={
              <div
                style={{
                  display: 'block',
                  overflow: 'hidden',
                  maxWidth: '100%',
                }}
              >
                {remediation.name}
              </div>
            }
          />
          <p style={{ wordBreak: 'break-word' }}>{`ID: ${remediation.id}`}</p>
        </FlexItem>
        <FlexItem style={{ marginTop: 'var(--pf-v5-global--spacer--sm)' }}>
          <Flex
            spaceItems={{ default: 'spaceItemsSm' }}
            flexWrap={{ default: 'wrap' }}
          >
            <FlexItem>
              <ExecutePlaybookButton
                isDisabled={
                  remediationStatus.connectedSystems === 0 ||
                  !permissions?.execute ||
                  isFedramp
                }
                connectedSystems={remediationStatus.connectedSystems}
                totalSystems={remediationStatus.totalSystems}
                areDetailsLoading={remediationStatus.areDetailsLoading}
                detailsError={remediationStatus.detailsError}
                permissions={permissions.execute}
                issueCount={remediation?.issues}
                remediation={remediation}
                refetchRemediationPlaybookRuns={refetchRemediationPlaybookRuns}
              />
            </FlexItem>
            <FlexItem>
              <Button
                isDisabled={!remediation?.issues.length}
                variant="secondary"
                onClick={handleDownload}
              >
                Download
              </Button>
            </FlexItem>
            <FlexItem>
              <RemediationDetailsDropdown
                remediation={remediation}
                remediationsList={allRemediations}
                refetchAllRemediations={refetchAllRemediations}
                updateRemPlan={updateRemPlan}
                refetch={refetch}
              />
            </FlexItem>
          </Flex>
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
  refetchRemediationPlaybookRuns: PropTypes.func,
};

export default RemediationDetailsPageHeader;
