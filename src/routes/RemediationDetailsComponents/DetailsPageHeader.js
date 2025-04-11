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
import React from 'react';
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
  updateRemPlan,
  refetch,
  permissions,
}) => {
  return (
    <PageHeader>
      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
        <FlexItem style={{ width: '50%' }}>
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
                  // !executable ||
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
                onClick={() => {
                  downloadPlaybook(remediation.id);
                  dispatchNotification({
                    title: 'Preparing playbook for download.',
                    description:
                      'Once complete, your download will start automatically.',
                    variant: 'info',
                    dismissable: true,
                    autoDismiss: true,
                  });
                }}
              >
                Download
              </Button>
            </SplitItem>
            <SplitItem>
              <RemediationDetailsDropdown
                remediation={remediation}
                remediationsList={allRemediations}
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
};

export default RemediationDetailsPageHeader;
