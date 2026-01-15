import { Flex, FlexItem, Spinner } from '@patternfly/react-core';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import React, { useCallback } from 'react';
import RemediationDetailsDropdown from '../../components/RemediationDetailsDropdown';
import PropTypes from 'prop-types';
import ExecuteButton from '../../components/ExecuteButton';

import { download } from '../../Utilities/DownloadPlaybookButton';
import ButtonWithToolTip from '../../Utilities/ButtonWithToolTip';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';

const RemediationDetailsPageHeader = ({
  remediation,
  remediationStatus,
  isFedramp,
  allRemediations,
  refetchAllRemediations,
  updateRemPlan,
  refetchRemediationDetails,
  permissions,
  refetchRemediationPlaybookRuns,
  isExecutable,
  detailsLoading,
}) => {
  const addNotification = useAddNotification();
  const handleDownload = useCallback(() => {
    download([remediation.id], [remediation], addNotification);
  }, [remediation, addNotification]);

  return (
    <PageHeader>
      <Flex
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        alignItems={{ default: 'alignItemsFlexStart' }}
        flexWrap={{ default: 'wrap' }}
      >
        <FlexItem grow={{ default: 'grow' }} style={{ minWidth: 0 }}>
          <PageHeaderTitle
            className="pf-v6-u-mb-sm"
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
        <FlexItem style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
          {remediationStatus.areDetailsLoading ? (
            <Spinner />
          ) : (
            <Flex
              spaceItems={{ default: 'spaceItemsSm' }}
              flexWrap={{ default: 'wrap' }}
            >
              <FlexItem>
                <ExecuteButton
                  isDisabled={
                    remediationStatus.connectedSystems === 0 ||
                    !permissions?.execute ||
                    isFedramp ||
                    !isExecutable
                  }
                  issueCount={remediation?.issue_count}
                  remediationStatus={remediationStatus}
                  remediation={remediation}
                  refetchRemediationPlaybookRuns={
                    refetchRemediationPlaybookRuns
                  }
                  detailsLoading={detailsLoading}
                />
              </FlexItem>
              <FlexItem>
                <ButtonWithToolTip
                  isDisabled={
                    !remediation?.issue_count || remediation.system_count === 0
                  }
                  onClick={handleDownload}
                  tooltipContent={
                    <div>
                      The remediation plan cannot be downloaded because it does
                      not include any actions or systems.
                    </div>
                  }
                >
                  Download
                </ButtonWithToolTip>
              </FlexItem>
              <FlexItem>
                <RemediationDetailsDropdown
                  remediation={remediation}
                  remediationsList={allRemediations}
                  refetchAllRemediations={refetchAllRemediations}
                  updateRemPlan={updateRemPlan}
                  refetchRemediationDetails={refetchRemediationDetails}
                />
              </FlexItem>
            </Flex>
          )}
        </FlexItem>
      </Flex>
    </PageHeader>
  );
};
RemediationDetailsPageHeader.propTypes = {
  remediation: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    auto_reboot: PropTypes.bool,
    archived: PropTypes.bool,
    created_by: PropTypes.shape({
      username: PropTypes.string,
      first_name: PropTypes.string,
      last_name: PropTypes.string,
    }),
    created_at: PropTypes.string,
    updated_by: PropTypes.shape({
      username: PropTypes.string,
      first_name: PropTypes.string,
      last_name: PropTypes.string,
    }),
    updated_at: PropTypes.string,
    issue_count: PropTypes.number,
    system_count: PropTypes.number,
  }),
  remediationStatus: PropTypes.shape({
    connectedSystems: PropTypes.number.isRequired,
    totalSystems: PropTypes.number.isRequired,
    areDetailsLoading: PropTypes.bool.isRequired,
    connectionError: PropTypes.any,
  }).isRequired,
  isFedramp: PropTypes.bool,
  allRemediations: PropTypes.array,
  updateRemPlan: PropTypes.func,
  refetchRemediationDetails: PropTypes.func,
  isExecutable: PropTypes.any,
  refetchAllRemediations: PropTypes.func,
  refetchRemediationPlaybookRuns: PropTypes.func,
  permissions: PropTypes.object.isRequired,
  detailsLoading: PropTypes.bool,
};

export default RemediationDetailsPageHeader;
