import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Title, Button, TabContent } from '@patternfly/react-core';
import { TableStateProvider } from 'bastilian-tabletools';

import DetailsBanner from '../DetailsBanners';
import RunSystemsTable from './RunSystemsTable';
import { formatUtc } from './helpers';
import useRunSystems from './hooks/useRunSystems';
import { StatusLabel } from '../../helpers';
import { RedoIcon } from '@patternfly/react-icons';

const RunTabContent = ({
  run,
  idx,
  isActive,
  remId,
  fetchSystems,
  openLogModal,
  refetchRemediationPlaybookRuns,
  setManualRefreshClicked,
  manualRefreshClicked,
  isPlaybookRunsLoading,
}) => {
  const { systems = [], loading } = useRunSystems(
    run,
    isActive,
    remId,
    fetchSystems,
  );

  const handleClick = async () => {
    setManualRefreshClicked(true);
    await refetchRemediationPlaybookRuns();
    setManualRefreshClicked(false);
  };
  const isLoading = isPlaybookRunsLoading || loading || manualRefreshClicked;

  return (
    <TabContent
      eventKey={idx}
      id={`run-${idx}`}
      activeKey={isActive ? idx : -1}
      hidden={!isActive}
    >
      <Flex
        className="pf-v6-u-mb-lg pf-v6-u-mt-lg"
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
      >
        <Flex direction={{ default: 'column' }}>
          <Flex>
            <Title headingLevel="h1">{formatUtc(run.updated_at)}</Title>
            <StatusLabel status={run.status} />
          </Flex>
          <small data-testid="text-small">
            {`Initiated by: ${run?.created_by?.username ?? 'unknown'}`}
          </small>
        </Flex>

        <Button
          icon={<RedoIcon className="pf-v6-u-mr-xs" data-testid="redo-icon" />}
          isDisabled={isLoading}
          isInline
          variant="link"
          onClick={handleClick}
        >
          Refresh
        </Button>
      </Flex>

      <DetailsBanner
        status={run.status}
        remediationPlanName={run.system_name}
        canceledAt={run.updated_at}
      />

      <TableStateProvider>
        <RunSystemsTable
          run={{ ...run, systems }}
          loading={isLoading}
          viewLogColumn={{
            title: '',
            props: { screenReaderText: 'View log' },
            exportKey: 'viewLog',
            Component: (system) => (
              <Button
                variant="link"
                style={{ padding: 0 }}
                onClick={() => openLogModal(run, system)}
                data-testid="view-log-button"
              >
                View log
              </Button>
            ),
          }}
        />
      </TableStateProvider>
    </TabContent>
  );
};

RunTabContent.propTypes = {
  run: PropTypes.object.isRequired,
  idx: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
  remId: PropTypes.string.isRequired,
  fetchSystems: PropTypes.func.isRequired,
  openLogModal: PropTypes.func.isRequired,
  refetchRemediationPlaybookRuns: PropTypes.func.isRequired,
  setManualRefreshClicked: PropTypes.func.isRequired,
  manualRefreshClicked: PropTypes.bool.isRequired,
  isPlaybookRunsLoading: PropTypes.bool.isRequired,
};

export default RunTabContent;
