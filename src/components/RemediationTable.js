import React, { useEffect, useContext, useState } from 'react';
import { useDispatch, useSelector as reduxSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Grid, GridItem, Stack, StackItem } from '@patternfly/react-core';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import { Spinner } from '@redhat-cloud-services/frontend-components/Spinner';
import { downloadPlaybook } from '../api';
import {
  getConnectionStatus,
  runRemediation,
  setEtag,
  getPlaybookRuns,
  loadRemediation,
  getEndpoint,
} from '../actions';
import { PermissionContext } from '../App';
import { ExecuteModal } from './Modals/ExecuteModal';
import { PlaybookCard } from './PlaybookCard';
import { EmptyRemediations } from './EmptyStates/EmptyRemediations';
import './RemediationTable.scss';

function skeleton() {
  return (
    <React.Fragment>
      <Main>
        <Spinner centered />
      </Main>
    </React.Fragment>
  );
}

const SORTING_ITERATEES = [
  null,
  'name',
  'system_count',
  'issue_count',
  'updated_at',
];

function RemediationTable({
  remediations,
  loadRemediations,
  sorter,
  filter,
  selector,
  pagination,
  shouldUpdateGrid,
  setShouldUpdateGrid,
  setRemediationCount,
  showArchived,
  setShowArchived,
}) {
  const { value, status } = remediations;
  let cards = [];

  const permission = useContext(PermissionContext);
  const [executeOpen, setExecuteOpen] = useState(false);
  const [showRefreshMessage, setShowRefreshMessage] = useState(false);
  const selectedRemediation = reduxSelector(
    (state) => state.selectedRemediation
  );
  const connectionStatus = reduxSelector((state) => state.connectionStatus);
  const runningRemediation = reduxSelector((state) => state.runRemediation);
  const sources = reduxSelector((state) => state.sources);
  const dispatch = useDispatch();

  function load() {
    const column = SORTING_ITERATEES[sorter.sortBy];
    if (showArchived) {
      loadRemediations(
        column,
        sorter.sortDir,
        filter.value,
        pagination.pageSize,
        pagination.offset
      );
    } else {
      const hideArchived = true;
      loadRemediations(
        column,
        sorter.sortDir,
        filter.value,
        pagination.pageSize,
        pagination.offset,
        undefined,
        hideArchived
      );
    }
  }

  useEffect(() => {
    if (shouldUpdateGrid === true) {
      setShouldUpdateGrid(false);
      load();
    }
  }, [shouldUpdateGrid]);

  useEffect(() => {
    if (runningRemediation.status === 'changed') {
      getConnectionStatus(selectedRemediation.remediation.id);
      setShowRefreshMessage(true);
    } else if (runningRemediation.status === 'fulfilled') {
      setExecuteOpen(false);
    }
  }, [runningRemediation.status]);

  useEffect(() => {
    if (remediations.value) {
      setRemediationCount(value.meta.total);
    }
  }, [remediations]);

  // Skeleton Loading
  if (status !== 'fulfilled') {
    return skeleton();
  }

  if (!showArchived) {
    cards = value.data.reduce((result, remediation) => {
      if (remediation.archived !== true) {
        result.push(remediation);
      }

      return result;
    }, []);
  } else {
    cards = value.data.map((remediation) => remediation);
  }

  if (cards.length === 0) {
    return (
      <EmptyRemediations
        archivedCount={value.data.length}
        setShowArchived={setShowArchived}
      />
    );
  }

  selector.register(cards);

  return (
    <React.Fragment>
      <Stack hasGutter>
        <StackItem>
          {executeOpen && (
            <ExecuteModal
              isOpen={executeOpen}
              onClose={() => {
                setShowRefreshMessage(false);
                setExecuteOpen(false);
              }}
              showRefresh={showRefreshMessage}
              remediationId={selectedRemediation.remediation.id}
              data={connectionStatus.data}
              etag={connectionStatus.etag}
              isLoading={connectionStatus.status !== 'fulfilled'}
              issueCount={selectedRemediation.remediation.issues.length}
              remediationStatus={runningRemediation.status}
              runRemediation={(id, etag) => {
                dispatch(runRemediation(id, etag)).then(() =>
                  dispatch(getPlaybookRuns(id))
                );
              }}
              setEtag={(etag) => {
                dispatch(setEtag(etag));
              }}
              getEndpoint={(id) => {
                dispatch(getEndpoint(id));
              }}
              sources={sources}
            />
          )}
        </StackItem>
        <StackItem>
          <Grid sm={12} md={6} lg={4} hasGutter>
            {cards.map((remediation, idx) => {
              return (
                <GridItem key={remediation.id}>
                  <PlaybookCard
                    remediation={remediation}
                    remediationIdx={idx}
                    archived={remediation.archived}
                    selector={selector}
                    setExecuteOpen={setExecuteOpen}
                    executeOpen={executeOpen}
                    update={setShouldUpdateGrid}
                    loadRemediation={loadRemediation}
                    getConnectionStatus={getConnectionStatus}
                    downloadPlaybook={downloadPlaybook}
                    permission={permission}
                  />
                </GridItem>
              );
            })}
          </Grid>
        </StackItem>
      </Stack>
    </React.Fragment>
  );
}

RemediationTable.propTypes = {
  remediations: PropTypes.object.isRequired,
  loadRemediations: PropTypes.func.isRequired,
  sorter: PropTypes.object.isRequired,
  filter: PropTypes.object.isRequired,
  selector: PropTypes.object.isRequired,
  pagination: PropTypes.object.isRequired,
  shouldUpdateGrid: PropTypes.bool.isRequired,
  setShouldUpdateGrid: PropTypes.func.isRequired,
  setRemediationCount: PropTypes.func.isRequired,
  showArchived: PropTypes.bool.isRequired,
  setShowArchived: PropTypes.func.isRequired,
};

export default RemediationTable;
