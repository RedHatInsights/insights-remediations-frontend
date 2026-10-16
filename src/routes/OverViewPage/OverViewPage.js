import React, { useCallback, useContext, useMemo, useState } from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import columns from '../Columns';
import useRemediations from '../../Utilities/Hooks/api/useRemediations';
import RemediationsTable from '../../components/RemediationsTable/RemediationsTable';
import {
  CreatedByFilter,
  ExecutionStatusFilter,
  ExpirationFilter,
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
  usePagination,
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
import { getOrgConfig } from '../api';

import TableEmptyState from './TableEmptyState';
import { CalendarFilterType } from './CalendarFilterType';

const getActualLastPageAfterDeletion = ({
  perPage = 10,
  total = 0,
  deletedCount = 1,
}) => {
  // Manually count the actual total items and last page index after deletion
  const actualTotal = Math.max(0, total - deletedCount);
  return Math.max(1, Math.ceil(actualTotal / perPage));
};

export const OverViewPage = () => {
  const dispatch = useDispatch();
  const chrome = useChrome();
  const addNotification = useAddNotification();
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [remediation, setRemediation] = useState('');
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const context = useContext(PermissionContext);

  const callbacks = useStateCallbacks();
  const tableState = useRawTableState();

  const currentlySelected = tableState?.selected || [];
  //TODO: Ongoing discussion with team on only fetching fieldsData on plans we're downloading
  const {
    result,
    fetchAllIds,
    loading,
    refetch: fetchRemediations,
  } = useRemediations('getRemediations', {
    useTableState: true,
    params: { hideArchived: false, fieldsData: ['last_playbook_run'] },
  });
  const { toolbarProps: { pagination: paginationControls } = {} } =
    usePagination({
      total: result?.meta?.total,
      perPage: tableState?.pagination?.state?.perPage || 10,
    });

  const { result: allRemediations, refetch: refetchAllRemediations } =
    useRemediations('getRemediations', {
      params: { fieldsData: ['name'] },
    });
  const {
    result: orgConfig,
    error: orgConfigError,
    refetch: refetchOrgConfig,
  } = useRemediations(getOrgConfig);

  const { fetch: deleteRem } = useRemediations('deleteRemediation', {
    skip: true,
  });

  const { fetch: deleteRelList } = useRemediations('deleteRemediations', {
    skip: true,
    useTableState: false,
    params: {},
  });

  const { fetchQueue } = useRemediationFetchExtras({
    fetch: deleteRelList,
  });

  const handleDownloadClick = async (itemId) => {
    await download([itemId], result.data, addNotification, chrome);
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
  }, [context.permissions.write, currentlySelected]);

  const items = useMemo(
    () =>
      result?.data?.map((item) => ({
        ...item,
        plan_warning_days: orgConfig?.plan_warning_days,
        isWarningWindowEnabled:
          !orgConfigError && orgConfig?.plan_warning_days > 0,
      })),
    [orgConfig?.plan_warning_days, orgConfigError, result?.data],
  );

  const handleSingleDeleteClick = async (id) => {
    return deleteRem({ id });
  };

  const handleRetentionPolicyUpdated = useCallback(() => {
    refetchOrgConfig?.();
    fetchRemediations?.();
  }, [refetchOrgConfig, fetchRemediations]);

  const refetchAfterDeletion = useCallback(
    // Refetch only if anything was deleted
    (deletedCount = 1) => {
      // Get the current page from the time of deletion
      const currentPage = tableState?.pagination?.state?.page;

      // Get the actual last page after deletion
      const actualLastPage = getActualLastPageAfterDeletion({
        perPage: tableState?.pagination?.state?.perPage,
        total: result?.meta?.total,
        deletedCount,
      });

      // If we eneded up being "behind" the actual last page after deletion, paginate back
      if (currentPage > actualLastPage) {
        paginationControls?.onSetPage?.(undefined, actualLastPage);
        return;
      }

      // Refetch
      fetchRemediations?.();
    },
    [
      fetchRemediations,
      paginationControls,
      result?.meta?.total,
      tableState?.pagination?.state?.page,
      tableState?.pagination?.state?.perPage,
    ],
  );

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
                if (isBulkDelete) {
                  chrome.analytics?.track('remediations - Plans Bulk Deleted', {
                    module: 'remediations',
                    count: currentlySelected.length,
                  });
                } else {
                  chrome.analytics?.track('remediations - Plan Deleted', {
                    module: 'remediations',
                    remediation_id: remediation.itemId,
                  });
                }
                addNotification({
                  title: `Remediation plan${
                    currentlySelected.length > 1 ? 's' : ''
                  } deleted`,
                  variant: 'success',
                  dismissable: true,
                  autoDismiss: true,
                });
                callbacks?.current?.resetSelection();
                refetchAfterDeletion(
                  isBulkDelete ? currentlySelected.length : 1,
                );
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
            onRetentionPolicyUpdated={handleRetentionPolicyUpdated}
          />
          <NoRemediationsPage />
        </>
      ) : (
        <>
          <OverViewPageHeader
            hasRemediations={Boolean(allRemediations?.data?.length)}
            onRetentionPolicyUpdated={handleRetentionPolicyUpdated}
          />
          <section className="pf-v6-u-ml-lg">
            <RemediationsTable
              aria-label="OverViewTable"
              ouiaId="OverViewTable"
              loading={loading}
              items={items}
              total={result?.meta?.total}
              columns={[...columns]}
              filters={{
                filterConfig: [
                  ...remediationNameFilter,
                  ...LastExecutedFilter,
                  ...ExecutionStatusFilter,
                  ...LastModifiedFilter,
                  ...CreatedByFilter,
                  ...ExpirationFilter,
                ],
                customFilterTypes: {
                  calendar: CalendarFilterType,
                },
              }}
              options={{
                sortBy: {
                  index: 7,
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
                      isDisabled: !context.permissions.inventoryHostsRead,
                    },
                    {
                      title: 'Rename',
                      onClick: (_event, _index, { item }) => {
                        setRemediation(item);
                        setIsRenameModalOpen(true);
                      },
                      isDisabled: !context.permissions.write,
                    },
                    {
                      title: (
                        <Content
                          className={
                            context.permissions.write
                              ? 'pf-v6-u-danger-color-100'
                              : ''
                          }
                        >
                          Delete
                        </Content>
                      ),
                      onClick: (_event, _index, { item }) => {
                        setIsBulkDelete(false);
                        setRemediation(item);
                        setIsDeleteModalOpen(true);
                      },
                      props: { screenReaderText: 'Delete button' },
                      isDisabled: !context.permissions.write,
                    },
                  ];
                },
                actions: actions,
                dedicatedAction: () => (
                  <DownloadPlaybookButton
                    selectedItems={currentlySelected}
                    data={result?.data}
                    dispatch={dispatch}
                    isDisabled={!context.permissions.inventoryHostsRead}
                    tooltipContent={
                      !context.permissions.inventoryHostsRead ? (
                        <div>
                          You don&apos;t have the required permissions to
                          download remediation plans.
                        </div>
                      ) : null
                    }
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
