import React, { useCallback, useMemo, useState } from 'react';
import RemediationsTable from '../../../components/RemediationsTable/RemediationsTable';
import PropTypes from 'prop-types';
import columns from './Columns';
import { emptyRows } from '../../../Frameworks/AsyncTableTools/AsyncTableTools/hooks/useTableView/views/helpers';
import { Button } from '@patternfly/react-core';
import TableStateProvider from '../../../Frameworks/AsyncTableTools/AsyncTableTools/components/TableStateProvider';
import useRemediationTableState from '../../../api/useRemediationTableState';
import { API_BASE } from '../../../config';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import useRemediationsQuery from '../../../api/useRemediationsQuery';
import useRemediationFetchExtras from '../../../api/useRemediationFetchExtras';
import { useRawTableState } from '../../../Frameworks/AsyncTableTools/AsyncTableTools/hooks/useTableState';
import { useParams } from 'react-router-dom';
import { dispatchNotification } from '../../../Utilities/dispatcher';
import chunk from 'lodash/chunk';
import ConfirmationDialog from '../../../components/ConfirmationDialog';
import useStateCallbacks from '../../../Frameworks/AsyncTableTools/AsyncTableTools/hooks/useTableState/hooks/useStateCallbacks';
import { actionNameFilter } from '../Filters';
import SystemsModal from './SystemsModal/SystemsModal';

const deleteIssues = (axios) => (params) => {
  return axios({
    method: 'delete',
    url: `${API_BASE}/remediations/${params.id}/issues`,
    data: {
      issue_ids: params.issue_ids,
    },
  });
};

const ActionsContent = ({ remediationDetails, refetch }) => {
  const axios = useAxiosWithPlatformInterceptors();
  const { id } = useParams();
  const { params } = useRemediationTableState(true);
  const tableState = useRawTableState();
  const currentlySelected = tableState?.selected;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [action, setAction] = useState();
  const [isSystemsModalOpen, setIsSystemsModalOpen] = useState(false);
  const [systemsToShow, setSystemsToShow] = useState([]);
  const [actionToShow, setActionToShow] = useState('');

  const callbacks = useStateCallbacks();

  const { fetchBatched: deleteActions } = useRemediationsQuery(
    deleteIssues(axios),
    {
      skip: true,
      batched: true,
    }
  );
  const { fetchQueue } = useRemediationFetchExtras({
    fetch: deleteActions,
  });

  const handleDelete = async (selected) => {
    const chunks = chunk(selected, 100);
    const queue = chunks.map((chunk) => ({
      id,
      issue_ids: chunk,
    }));
    return await fetchQueue(queue);
  };

  //Back end is currently working on filtering - This filter acts as a placegholder
  const nameFilter = tableState?.filters?.name?.[0] ?? '';
  const allIssues = remediationDetails?.issues ?? [];
  const filteredIssues = useMemo(() => {
    if (!nameFilter) {
      return allIssues;
    }
    return allIssues.filter((issue) => issue.description.includes(nameFilter));
  }, [allIssues, nameFilter]);
  const start = params?.offset ?? 0;
  const end = (params?.limit ?? 10) + start;
  const pageOfIssues = filteredIssues.slice(start, end);

  const columnsWithSystemsButton = useMemo(() => {
    return columns.map((col) => {
      if (col.exportKey === 'system_count') {
        return {
          ...col,
          renderFunc: (_data, _id, { systems, description }) => (
            <Button
              size="sm"
              style={{ padding: '0' }}
              variant="link"
              onClick={() => {
                setActionToShow(description);
                setSystemsToShow(systems);
                setIsSystemsModalOpen(true);
              }}
            >
              {`${systems.length} system${systems.length !== 1 ? 's' : ''}`}
            </Button>
          ),
        };
      }
      return col;
    });
  }, []);
  const getAllIssueIds = useCallback(
    () => filteredIssues.map((i) => i.id),
    [filteredIssues]
  );
  return (
    <section
      className={'pf-v5-l-page__main-section pf-v5-c-page__main-section'}
    >
      {isSystemsModalOpen && (
        <SystemsModal
          isOpen={isSystemsModalOpen}
          onClose={() => setIsSystemsModalOpen(false)}
          systems={systemsToShow}
          actionName={actionToShow}
        />
      )}
      {isDeleteModalOpen && (
        <ConfirmationDialog
          isOpen={isDeleteModalOpen}
          title={`Remove`}
          text="The selected actions will no longer be executed in this plan."
          confirmText="Remove"
          onClose={(confirm) => {
            setIsDeleteModalOpen(false);
            if (confirm) {
              const chopped = isBulkDelete ? currentlySelected : action;
              handleDelete(chopped)
                .then(() => {
                  dispatchNotification({
                    title: `Succesfully deleted actions`,
                    variant: 'success',
                    dismissable: true,
                    autoDismiss: true,
                  });
                  callbacks?.current?.resetSelection();
                  refetch();
                  setIsDeleteModalOpen(false);
                  setIsBulkDelete(false);
                })
                .catch(() => {
                  dispatchNotification({
                    title: `Failed to delete actions`,
                    variant: 'danger',
                    dismissable: true,
                    autoDismiss: true,
                  });
                });
            }
          }}
        />
      )}
      <RemediationsTable
        aria-label="ActionsTable"
        ouiaId="ActionsTable"
        variant="compact"
        items={pageOfIssues}
        total={filteredIssues.length}
        columns={[...columnsWithSystemsButton]}
        filters={{
          filterConfig: [...actionNameFilter],
        }}
        options={{
          //Known bug in asyncTableTools - needed for bulkSelect
          onSelect: () => '',
          itemIdsInTable: getAllIssueIds,
          itemIdsOnPage: pageOfIssues.map((i) => i.id),
          total: filteredIssues.length,
          actionResolver: () => {
            return [
              {
                title: 'Remove',
                onClick: (_event, _index, { item }) => {
                  setIsBulkDelete(false);
                  setAction([item.id]);
                  setIsDeleteModalOpen(true);
                },
              },
            ];
          },
          dedicatedAction: () => (
            <Button
              variant="secondary"
              isDisabled={currentlySelected?.length === 0}
              onClick={() => {
                setIsBulkDelete(true);
                setIsDeleteModalOpen(true);
              }}
            >
              Remove
            </Button>
          ),
          emptyRows: emptyRows(columns.length),
        }}
      />
    </section>
  );
};

ActionsContent.propTypes = {
  remediationDetails: PropTypes.object,
  refetch: PropTypes.func,
};

const ActionsContentProvider = (props) => {
  return (
    <TableStateProvider>
      <ActionsContent {...props} />
    </TableStateProvider>
  );
};

export default ActionsContentProvider;
