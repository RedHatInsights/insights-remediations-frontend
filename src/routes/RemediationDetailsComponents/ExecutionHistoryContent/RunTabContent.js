import React from 'react';
import PropTypes from 'prop-types';
import {
  Flex,
  Title,
  Text,
  TextVariants,
  Button,
  TabContent,
} from '@patternfly/react-core';
import TableStateProvider from '../../../Frameworks/AsyncTableTools/AsyncTableTools/components/TableStateProvider';

import DetailsBanner from '../DetailsBanners';
import RunSystemsTable from './RunSystemsTable';
import { formatUtc } from './helpers';
import useRunSystems from './hooks/useRunSystems';
import { StatusLabel } from '../../helpers';

const RunTabContent = ({
  run,
  idx,
  isActive,
  remId,
  fetchSystems,
  openLogModal,
}) => {
  const { systems = [], loading } = useRunSystems(
    run,
    isActive,
    remId,
    fetchSystems
  );

  return (
    <TabContent
      eventKey={idx}
      id={`run-${idx}`}
      activeKey={isActive ? idx : -1}
      hidden={!isActive}
    >
      <Flex
        direction={{ default: 'column' }}
        className="pf-v5-u-mb-lg pf-v5-u-mt-lg"
      >
        <Flex>
          <Title headingLevel="h1">{formatUtc(run.updated_at)}</Title>
          <StatusLabel status={run.status} />
        </Flex>
        <Text>
          <TextVariants.small>
            {`Initiated by: ${run?.created_by?.first_name ?? 'unknown'}`}
          </TextVariants.small>
        </Text>
      </Flex>

      <DetailsBanner
        status={run.status}
        remediationPlanName={run.system_name}
        canceledAt={run.updated_at}
      />

      <TableStateProvider>
        <RunSystemsTable
          run={{ ...run, systems }}
          loading={loading}
          viewLogColumn={{
            title: '',
            screenReaderText: 'View log',
            exportKey: 'viewLog',
            renderFunc: (_d, _i, system) => (
              <Button
                variant="link"
                style={{ padding: 0 }}
                onClick={() => openLogModal(run, system)}
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
};

export default RunTabContent;
