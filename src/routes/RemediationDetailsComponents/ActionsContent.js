import React, { useState } from 'react';
import RemediationsTable from '../../components/RemediationsTable/RemediationsTable';
import PropTypes from 'prop-types';
import columns from './Columns';
import { emptyRows } from '../../Frameworks/AsyncTableTools/AsyncTableTools/hooks/useTableView/views/helpers';
import { Button } from '@patternfly/react-core';
import TableStateProvider from '../../Frameworks/AsyncTableTools/AsyncTableTools/components/TableStateProvider';
import useRemediationTableState from '../../api/useRemediationTableState';
import { API_BASE } from '../../config';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import useRemediationsQuery from '../../api/useRemediationsQuery';
import useRemediationFetchExtras from '../../api/useRemediationFetchExtras';
import { useRawTableState } from '../../Frameworks/AsyncTableTools/AsyncTableTools/hooks/useTableState';
import { useParams } from 'react-router-dom';
import { dispatchNotification } from '../../Utilities/dispatcher';
import { chunkArray } from './helpers';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import useStateCallbacks from '../../Frameworks/AsyncTableTools/AsyncTableTools/hooks/useTableState/hooks/useStateCallbacks';

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
  const callbacks = useStateCallbacks();

  // console.log(actions, 'actions here');
  //search filter
  //systems cell modal

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
    const chunks = chunkArray(selected, 100);
    const queue = chunks.map((chunk) => ({
      id,
      issue_ids: chunk,
    }));
    return await fetchQueue(queue);
  };

  return (
    <section
      className={'pf-v5-l-page__main-section pf-v5-c-page__main-section'}
    >
      {isDeleteModalOpen && (
        <ConfirmationDialog
          isOpen={isDeleteModalOpen}
          title={`Remove action(s)`}
          text="You will not be able to recover this/these action(s)"
          confirmText="Remove action(s)"
          onClose={(confirm) => {
            setIsDeleteModalOpen(false);
            if (confirm) {
              const chopped = isBulkDelete ? currentlySelected : action;
              handleDelete(chopped)
                .then(() => {
                  dispatchNotification({
                    title: `Succesfully deleted action(s)`,
                    description: '',
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
                    title: `Failed to delete action(s)`,
                    description: '',
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
        items={remediationDetails?.issues?.slice(
          params?.offset || 0,
          params?.limit + params?.offset || 10
        )}
        total={remediationDetails?.issues?.length}
        columns={[...columns]}
        options={{
          onSelect: () => '',
          itemIdsInTable: remediationDetails?.issues?.map(({ id }) => id),
          itemIdsOnPage: remediationDetails?.issues?.slice(
            params?.offset || 0,
            params?.limit + params?.offset || 10
          ),
          total: remediationDetails?.issues?.length,
          actionResolver: () => {
            return [
              {
                title: 'Remove action',
                onClick: (_event, _index, { item }) => {
                  setIsBulkDelete(false);
                  setAction(item.id);
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
              Remove Action
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
