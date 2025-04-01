import React, { useEffect, useMemo, useRef, useState } from 'react';
import columns from './Columns';
import useRemediationsQuery from '../api/useRemediationsQuery';
import { API_BASE } from '../config';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import RemediationsTable from '../components/RemediationsTable/RemediationsTable';
import {
  calendarFilterType,
  ExecutionStatusFilter,
  LastExecutedFilter,
  LastModified,
  remediationNameFilter,
} from './Filters';
import {
  download,
  DownloadPlaybookButton,
} from '../Utilities/DownloadPlaybookButton';
import { useDispatch } from 'react-redux';
import RenameModal from '../components/RenameModal';
import { useRemediationsList } from '../Utilities/useRemediationsList';
import { dispatchNotification } from '../Utilities/dispatcher';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { useRawTableState } from '../Frameworks/AsyncTableTools/AsyncTableTools/hooks/useTableState';
import TableStateProvider from '../Frameworks/AsyncTableTools/AsyncTableTools/components/TableStateProvider';
import useStateCallbacks from '../Frameworks/AsyncTableTools/AsyncTableTools/hooks/useTableState/hooks/useStateCallbacks';

const getRemediations = (axios) => (params) => {
  return axios.get(`${API_BASE}/remediations`, { params });
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
  const remediationsList = useRemediationsList();
  const callbacks = useStateCallbacks();
  const tableState = useRawTableState();

  const selectedRef = useRef([]);
  useEffect(() => {
    selectedRef.current = tableState?.selected || [];
  }, [tableState?.selected]);

  const {
    result,
    /*loading, error,*/ fetchAllIds,
    refetch: fetchRemediations,
  } = useRemediationsQuery(getRemediations(axios), {
    useTableState: true,
    params: { hide_archived: showArchived },
  });

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

  const { fetch: deleteReList } = useRemediationsQuery(
    deleteRemediationList(axios),
    {
      skip: true,
    }
  );

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
        title: `Archived playbooks`,
        dismissable: true,
        autoDismiss: true,
      });
      fetchRemediations();
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
  const handleBulkDeleteClick = async (selected) => {
    await deleteReList({ remediation_ids: selected }).then(() => {
      dispatchNotification({
        title: `Succesfully deleted remediation plans`,
        description: '',
        variant: 'success',
        dismissable: true,
        autoDismiss: true,
      });
      fetchRemediations();
    });
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

  const actions = useMemo(() => {
    return [
      {
        label: 'Archive',
        onClick: () => {
          const currentSelection = [...selectedRef.current];
          handleBulkArchiveClick(currentSelection);
        },
      },
      {
        label: 'Unarchive',
        onClick: () => {
          const currentSelection = [...selectedRef.current];
          handleBulkUnArchiveClick(currentSelection);
        },
      },
      {
        label: 'Delete',
        onClick: () => {
          const currentSelection = [...selectedRef.current];
          handleBulkDeleteClick(currentSelection);
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
    tableState?.selected,
    showArchived,
    handleBulkDeleteClick,
  ]);

  return (
    <div>
      {isRenameModalOpen && (
        <RenameModal
          remediation={remediation}
          isRenameModalOpen={isRenameModalOpen}
          setIsRenameModalOpen={setIsRenameModalOpen}
          remediationsList={remediationsList}
        />
      )}
      {isDeleteModalOpen && (
        <ConfirmationDialog
          isOpen={isDeleteModalOpen}
          title="Remove playbook?"
          text="You will not be able to recover this Playbook"
          confirmText="Remove playbook"
          onClose={(confirm) => {
            setIsDeleteModalOpen(false);
            if (confirm) {
              deleteRem({ id: remediation.itemId }).then(() => {
                dispatchNotification({
                  title: `Deleted playbook ${remediation.name}`,
                  variant: 'success',
                  dismissable: true,
                  autoDismiss: true,
                });
                fetchRemediations();
                isDeleteModalOpen(false);
              });
            }
          }}
        />
      )}
      <RemediationsTable
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
                title: item.archived ? 'Unarchived' : 'Archive',
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
                title: 'Delete',
                onClick: (_event, _index, { item }) => {
                  setRemediation(item);
                  setIsDeleteModalOpen(true);
                },
              },
            ];
          },
          actions: actions,
          dedicatedAction: () =>
            DownloadPlaybookButton(
              tableState?.selected || [],
              result?.data,
              dispatch
            ),
        }}
      />
    </div>
  );
};

const OverViewPageProvider = () => {
  return (
    <TableStateProvider>
      <OverViewPage />
    </TableStateProvider>
  );
};
export default OverViewPageProvider;
