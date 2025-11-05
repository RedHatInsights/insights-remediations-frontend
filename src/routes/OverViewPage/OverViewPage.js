import React, { useContext, useMemo, useState } from 'react';
import columns from '../Columns';
import useRemediationsQuery from '../../api/useRemediationsQuery';
import RemediationsTable from '../../components/RemediationsTable/RemediationsTable';
import {
  CreatedByFilter,
  ExecutionStatusFilter,
  LastExecutedFilter,
  LastModifiedFilter,
  remediationNameFilter,
} from '../Filters';
import {
  download,
  DownloadPlaybookButton,
} from '../../Utilities/DownloadPlaybookButton';
import { useDispatch } from 'react-redux';
import RenameModal from '../../components/RenameModal';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import {
  useRawTableState,
  TableStateProvider,
  useStateCallbacks,
} from 'bastilian-tabletools';
import NoRemediationsPage from '../../components/NoRemediationsPage';
import { Content } from '@patternfly/react-core';
import useRemediationFetchExtras from '../../api/useRemediationFetchExtras';
import { OverViewPageHeader } from './OverViewPageHeader';
import { PermissionContext } from '../../App';
import chunk from 'lodash/chunk';

import TableEmptyState from './TableEmptyState';
import { CalendarFilterType } from './CalendarFilterType';

export const OverViewPage = () => {
  const dispatch = useDispatch();
  const addNotification = useAddNotification();
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [remediation, setRemediation] = useState('');
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const context = useContext(PermissionContext);

  const callbacks = useStateCallbacks();
  const tableState = useRawTableState();

  const currentlySelected = tableState?.selected || [];
  const {
    result,
    fetchAllIds,
    loading,
    refetch: fetchRemediations,
  } = useRemediationsQuery('getRemediations', {
    useTableState: true,
    params: { hideArchived: false, fieldsData: ['playbook_runs'] },
  });

  const { result: allRemediations, refetch: refetchAllRemediations } =
    useRemediationsQuery('getRemediations', {
      params: { fieldsData: ['name'] },
    });

  const { fetch: deleteRem } = useRemediationsQuery('deleteRemediation', {
    skip: true,
  });

  const { fetchBatched: deleteRelList } = useRemediationsQuery(
    'deleteRemediations',
    {
      skip: true,
      batched: true,
    },
  );

  const { fetchQueue } = useRemediationFetchExtras({
    fetch: deleteRelList,
  });

  const handleDownloadClick = async (itemId) => {
    await download([itemId], result.data, addNotification);
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
              ? 'pf-v6-u-color-200'
              : 'pf-v6-u-danger-color-100',
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
          title={`Delete remediation plan${
            currentlySelected.length > 1 ? 's' : ''
          }?`}
          text={`${
            currentlySelected.length > 1
              ? 'Deleting remediation plans are '
              : 'Deleting a remediation plan is '
          } permanent and cannot be undone.`}
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
                addNotification({
                  title: `Remediation plan${
                    currentlySelected.length > 1 ? 's' : ''
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
        <>
          <OverViewPageHeader
            hasRemediations={Boolean(allRemediations?.data?.length)}
          />
          <NoRemediationsPage />
        </>
      ) : (
        <>
          <OverViewPageHeader
            hasRemediations={Boolean(allRemediations?.data?.length)}
          />
          <section className="pf-v6-u-ml-lg">
            <RemediationsTable
              aria-label="OverViewTable"
              ouiaId="OverViewTable"
              loading={loading}
              items={result?.data}
              total={result?.meta?.total}
              columns={[...columns]}
              filters={{
                filterConfig: [
                  ...remediationNameFilter,
                  ...LastExecutedFilter,
                  ...ExecutionStatusFilter,
                  ...LastModifiedFilter,
                  ...CreatedByFilter,
                ],
                customFilterTypes: {
                  calendar: CalendarFilterType,
                },
              }}
              options={{
                sortBy: {
                  index: 6,
                  direction: 'desc',
                },
                manageColumns: true,
                onSelect: true,
                itemIdsInTable: fetchAllIds,
                itemIdsOnPage: result?.data.map(({ id }) => id),
                total: result?.meta?.total,
                tableProps: {
                  variant: 'compact',
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
                        <Content className="pf-v6-u-danger-color-100">
                          Delete
                        </Content>
                      ),
                      onClick: (_event, _index, { item }) => {
                        setIsBulkDelete(false);
                        setRemediation(item);
                        setIsDeleteModalOpen(true);
                      },
                      props: { screenReaderText: 'Delete button' },
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
                EmptyState: TableEmptyState,
              }}
            />
          </section>
        </>
      )}
    </div>
  );
};

const OverViewPageProvider = () => (
  <TableStateProvider>
    <OverViewPage />
  </TableStateProvider>
);
export default OverViewPageProvider;
