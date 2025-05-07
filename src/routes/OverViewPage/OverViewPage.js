import React, { useContext, useMemo, useState } from 'react';
import columns from '../Columns';
import useRemediationsQuery from '../../api/useRemediationsQuery';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import RemediationsTable from '../../components/RemediationsTable/RemediationsTable';
import {
  calendarFilterType,
  ExecutionStatusFilter,
  LastExecutedFilter,
  LastModified,
  remediationNameFilter,
} from '../Filters';
import {
  download,
  DownloadPlaybookButton,
} from '../../Utilities/DownloadPlaybookButton';
import { useDispatch } from 'react-redux';
import RenameModal from '../../components/RenameModal';
import { dispatchNotification } from '../../Utilities/dispatcher';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { useRawTableState } from '../../Frameworks/AsyncTableTools/AsyncTableTools/hooks/useTableState';
import TableStateProvider from '../../Frameworks/AsyncTableTools/AsyncTableTools/components/TableStateProvider';
import useStateCallbacks from '../../Frameworks/AsyncTableTools/AsyncTableTools/hooks/useTableState/hooks/useStateCallbacks';
import NoRemediationsPage from '../../components/NoRemediationsPage';
import { TextContent } from '@patternfly/react-core';
import { emptyRows } from '../../Frameworks/AsyncTableTools/AsyncTableTools/hooks/useTableView/views/helpers';
import useRemediationFetchExtras from '../../api/useRemediationFetchExtras';
import { OverViewPageHeader } from './OverViewPageHeader';
import { PermissionContext } from '../../App';
import chunk from 'lodash/chunk';
import {
  deleteRemediation,
  deleteRemediationList,
  getRemediations,
  getRemediationsList,
} from '../api';

export const OverViewPage = () => {
  const dispatch = useDispatch();
  const axios = useAxiosWithPlatformInterceptors();
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [remediation, setRemediation] = useState('');
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const context = useContext(PermissionContext);

  const callbacks = useStateCallbacks();
  const tableState = useRawTableState();

  const currentlySelected = tableState?.selected;
  const {
    result,
    fetchAllIds,
    loading,
    refetch: fetchRemediations,
  } = useRemediationsQuery(getRemediations(axios), {
    useTableState: true,
    params: { hide_archived: false, 'fields[data]': 'playbook_runs' },
  });

  const { result: allRemediations, refetch: refetchAllRemediations } =
    useRemediationsQuery(getRemediationsList(axios));

  const { fetch: deleteRem } = useRemediationsQuery(deleteRemediation(axios), {
    skip: true,
  });

  const { fetchBatched: deleteRelList } = useRemediationsQuery(
    deleteRemediationList(axios),
    {
      skip: true,
      batched: true,
    }
  );

  const { fetchQueue } = useRemediationFetchExtras({
    fetch: deleteRelList,
  });

  const handleDownloadClick = async (itemId) => {
    await download([itemId], result.data, dispatch);
  };

  const handleBulkDeleteClick = async (selected) => {
    const chunks = chunk(selected, 100);
    const queue = chunks.map((chunk) => ({
      remediation_ids: chunk,
    }));
    return await fetchQueue(queue);
  };

  const actions = useMemo(() => {
    return [
      {
        label: 'Delete',
        props: {
          className:
            !context.permissions.write || !currentlySelected?.length
              ? 'pf-v5-u-color-200'
              : 'pf-v5-u-danger-color-100',
          isDisabled: !context.permissions.write || !currentlySelected?.length,
        },

        onClick: () => {
          setIsBulkDelete(true);
          setIsDeleteModalOpen(true);
        },
      },
    ];
  }, [currentlySelected, handleBulkDeleteClick]);
  const handleSingleDeleteClick = async (id) => {
    return deleteRem({ id });
  };
  return (
    <div>
      {isRenameModalOpen && (
        <RenameModal
          remediation={remediation}
          isRenameModalOpen={isRenameModalOpen}
          setIsRenameModalOpen={setIsRenameModalOpen}
          remediationsList={allRemediations.data}
          fetch={fetchRemediations}
          refetch={refetchAllRemediations}
        />
      )}
      {isDeleteModalOpen && (
        <ConfirmationDialog
          isOpen={isDeleteModalOpen}
          title={`Delete remediation plan?`}
          text="Deleting a remediation plan is permanent and cannot be undone."
          confirmText="Delete"
          selectedItems={
            currentlySelected.length > 0 ? currentlySelected : remediation
          }
          onClose={(confirm) => {
            setIsDeleteModalOpen(false);
            if (confirm) {
              let executeDeleteFunction = isBulkDelete
                ? handleBulkDeleteClick(currentlySelected)
                : handleSingleDeleteClick(remediation.itemId);

              executeDeleteFunction.then(() => {
                dispatchNotification({
                  title: `Remediation plan${
                    currentlySelected.length > 0 && 's'
                  } deleted`,
                  variant: 'success',
                  dismissable: true,
                  autoDismiss: true,
                });
                callbacks?.current?.resetSelection();
                fetchRemediations();
                setIsDeleteModalOpen(false);
              });
            }
            setIsBulkDelete(false);
          }}
        />
      )}
      {allRemediations?.data.length === 0 ? (
        <NoRemediationsPage />
      ) : (
        <RemediationsTable
          aria-label="OverViewTable"
          ouiaId="OverViewTable"
          variant="compact"
          loading={loading}
          items={result?.data}
          total={result?.meta?.total}
          columns={[...columns]}
          filters={{
            filterConfig: [
              ...remediationNameFilter,
              ...LastExecutedFilter,
              ...ExecutionStatusFilter,
              ...LastModified,
            ],
          }}
          options={{
            sortBy: {
              index: 6,
              direction: 'desc',
            },
            onSelect: () => '',
            itemIdsInTable: fetchAllIds,
            manageColumns: true,
            itemIdsOnPage: result?.data.map(({ id }) => id),
            total: result?.meta?.total,
            //Connect filter to tableState and send params
            customFilterTypes: {
              calendar: calendarFilterType,
            },
            actionResolver: () => {
              return [
                {
                  title: 'Download',
                  onClick: (_event, _index, { item }) => {
                    handleDownloadClick(item.id);
                  },
                },
                {
                  title: 'Rename',
                  onClick: (_event, _index, { item }) => {
                    setRemediation(item);
                    setIsRenameModalOpen(true);
                  },
                },
                {
                  title: (
                    <TextContent className="pf-v5-u-danger-color-100">
                      Delete
                    </TextContent>
                  ),
                  onClick: (_event, _index, { item }) => {
                    setIsBulkDelete(false);
                    setRemediation(item);
                    setIsDeleteModalOpen(true);
                  },
                },
              ];
            },
            actions: actions,
            dedicatedAction: () => (
              <DownloadPlaybookButton
                selectedItems={currentlySelected}
                data={result?.data}
                dispatch={dispatch}
              />
            ),
            emptyRows: emptyRows(columns.length),
          }}
        />
      )}
    </div>
  );
};

const OverViewPageProvider = () => {
  return (
    <TableStateProvider>
      <OverViewPageHeader />
      <section
        className={'pf-v5-l-page__main-section pf-v5-c-page__main-section'}
      >
        <OverViewPage />
      </section>
    </TableStateProvider>
  );
};
export default OverViewPageProvider;
