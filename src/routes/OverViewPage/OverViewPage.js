import React, { useContext, useMemo, useState } from 'react';
import columns from '../Columns';
import useRemediationsQuery from '../../api/useRemediationsQuery';
import { API_BASE } from '../../config';
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
import NoRemediationsTable from '../../components/NoRemediationsTable';
import { TextContent } from '@patternfly/react-core';
import { emptyRows } from '../../Frameworks/AsyncTableTools/AsyncTableTools/hooks/useTableView/views/helpers';
import useRemediationFetchExtras from '../../api/useRemediationFetchExtras';
import { OverViewPageHeader } from './OverViewPageHeader';
import { PermissionContext } from '../../App';

const getRemediations = (axios) => (params) => {
  return axios.get(`${API_BASE}/remediations/`, { params });
};

const getRemediationsList = (axios) => () => {
  return axios.get(`${API_BASE}/remediations/?fields[data]=name`);
};

const archiveRemediationPlans = (axios) => (params) => {
  return axios.patch(`${API_BASE}/remediations/${params.id}`, {
    archived: true,
  });
};

const unarchiveRemediationPlans = (axios) => (params) => {
  return axios.patch(`${API_BASE}/remediations/${params.id}`, {
    archived: false,
  });
};

const deleteRemediation = (axios) => (params) => {
  return axios.delete(`${API_BASE}/remediations/${params.id}`);
};

const deleteRemediationList = (axios) => (params) => {
  return axios({
    method: 'delete',
    url: `${API_BASE}/remediations`,
    data: {
      remediation_ids: params.remediation_ids,
    },
  });
};

export const OverViewPage = () => {
  const dispatch = useDispatch();
  const axios = useAxiosWithPlatformInterceptors();
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [remediation, setRemediation] = useState('');
  const [showArchived, setShowArchived] = useState(true);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const context = useContext(PermissionContext);

  // const remediationsList = useRemediationsList();
  const callbacks = useStateCallbacks();
  const tableState = useRawTableState();

  const currentlySelected = tableState?.selected;
  const {
    result,
    /*loading, error,*/ fetchAllIds,
    refetch: fetchRemediations,
  } = useRemediationsQuery(getRemediations(axios), {
    useTableState: true,
    params: { hide_archived: showArchived, 'fields[data]': 'playbook_runs' },
  });

  const { result: allRemediations, refetch: refetchAllRemediations } =
    useRemediationsQuery(getRemediationsList(axios));

  const { fetch: archiveRemediation } = useRemediationsQuery(
    archiveRemediationPlans(axios),
    {
      skip: true,
    }
  );
  const { fetch: unarchiveRemediation } = useRemediationsQuery(
    unarchiveRemediationPlans(axios),
    {
      skip: true,
    }
  );
  const handleArchiveClick = async (itemId, name) => {
    await archiveRemediation({ id: itemId }).then(() => {
      dispatchNotification({
        variant: 'info',
        title: `Archived playbook ${name}`,
        dismissable: true,
        autoDismiss: true,
      });
      fetchRemediations();
    });
  };

  const handleUnarchiveClick = async (itemId, name) => {
    await unarchiveRemediation({ id: itemId }).then(() => {
      dispatchNotification({
        variant: 'info',
        title: `Unarchived playbook ${name}`,
        dismissable: true,
        autoDismiss: true,
      });
      fetchRemediations();
    });
  };

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

  const handleBulkUnArchiveClick = async (selected) => {
    try {
      const archivePromises = selected.map((remId) =>
        unarchiveRemediation({ id: remId })
      );
      await Promise.all(archivePromises);
      dispatchNotification({
        variant: 'info',
        title: `Unarchived playbooks`,
        dismissable: true,
        autoDismiss: true,
      });
      callbacks?.current?.resetSelection();
    } catch (error) {
      console.error('Error during bulk archive:', error);
      dispatchNotification({
        variant: 'danger',
        title: 'Error archiving playbooks',
        description: error.message,
        dismissable: true,
        autoDismiss: true,
      });
    }
  };

  const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  const handleBulkDeleteClick = async (selected) => {
    const chunks = chunkArray(selected, 100);
    const queue = chunks.map((chunk) => ({
      remediation_ids: chunk,
    }));
    return await fetchQueue(queue);
  };
  const handleBulkArchiveClick = async (selected) => {
    try {
      const archivePromises = selected.map((remId) =>
        archiveRemediation({ id: remId })
      );
      await Promise.all(archivePromises);
      dispatchNotification({
        variant: 'info',
        title: `Archived playbooks`,
        dismissable: true,
        autoDismiss: true,
      });
      await fetchRemediations();
      callbacks?.current?.resetSelection();
    } catch (error) {
      console.error('Error during bulk archive:', error);
      dispatchNotification({
        variant: 'danger',
        title: 'Error archiving playbooks',
        description: error.message,
        dismissable: true,
        autoDismiss: true,
      });
    }
  };
  console.log(context.permissions.write, 'context.permissions.write ');
  const actions = useMemo(() => {
    return [
      {
        label: 'Archive',
        props: {
          isDisabled: !context.permissions.write || !currentlySelected?.length,
        },
        onClick: () => {
          handleBulkArchiveClick(currentlySelected);
        },
      },
      {
        label: 'Unarchive',
        props: {
          isDisabled: !context.permissions.write || !currentlySelected?.length,
        },
        onClick: () => {
          handleBulkUnArchiveClick(currentlySelected);
        },
      },
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
      {
        label: `${!showArchived ? 'Hide' : 'Show'} archived`,
        onClick: () => {
          setShowArchived(!showArchived);
        },
      },
    ];
  }, [
    handleBulkArchiveClick,
    handleBulkUnArchiveClick,
    currentlySelected,
    showArchived,
    handleBulkDeleteClick,
  ]);
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
          title={`Remove playbook(s)`}
          text="You will not be able to recover this Playbook"
          confirmText="Remove playbook"
          selectedItems={currentlySelected}
          onClose={(confirm) => {
            setIsDeleteModalOpen(false);
            if (confirm) {
              let executeDeleteFunction = isBulkDelete
                ? handleBulkDeleteClick(currentlySelected)
                : handleSingleDeleteClick(remediation.itemId);

              executeDeleteFunction.then(() => {
                dispatchNotification({
                  title: `Succesfully deleted remediation plan(s)`,
                  description: '',
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
        <NoRemediationsTable />
      ) : (
        <RemediationsTable
          aria-label="OverViewTable"
          ouiaId="OverViewTable"
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
            actionResolver: ({ item }) => {
              return [
                {
                  title: item?.archived ? 'Unarchived' : 'Archive',
                  onClick: (_event, _index, { item }) => {
                    item?.archived === true
                      ? handleUnarchiveClick(item.id, item.name)
                      : handleArchiveClick(item.id, item.name);
                  },
                },
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
