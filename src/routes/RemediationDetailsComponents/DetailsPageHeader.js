import { Button, Flex, FlexItem, Spinner } from '@patternfly/react-core';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import React, { useCallback } from 'react';
import RemediationDetailsDropdown from '../../components/RemediationDetailsDropdown';
import PropTypes from 'prop-types';
import ExecuteButton from '../../components/ExecuteButton';
import { useDispatch } from 'react-redux';
import { download } from '../../Utilities/DownloadPlaybookButton';

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
  isExecutable,
  fullRemList,
}) => {
  const dispatch = useDispatch();
  const handleDownload = useCallback(() => {
    download([remediation.id], fullRemList, dispatch);
  }, [remediation.id, fullRemList, dispatch]);

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
                  issueCount={remediation?.issues.length}
                  remediationStatus={remediationStatus}
                  remediation={remediation}
                  refetchRemediationPlaybookRuns={
                    refetchRemediationPlaybookRuns
                  }
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
  fullRemList: PropTypes.array,
};

export default RemediationDetailsPageHeader;
