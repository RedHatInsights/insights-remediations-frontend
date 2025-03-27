import React, { useState } from 'react';
import columns from './Columns';
import TableStateProvider from '../Frameworks/AsyncTableTools/AsyncTableTools/components/TableStateProvider';
import useRemediationsQuery from '../api/useRemediationsQuery';
import { API_BASE } from '../config';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import RemediationsTable from '../components/RemediationsTable/RemediationsTable';
import {
  // CreatedFilter,
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
  return axios.delete(`${API_BASE}/remediations`, { params });
};

export const OverViewPage = () => {
  const dispatch = useDispatch();
  const axios = useAxiosWithPlatformInterceptors();
  const [selectedItems, setSelectedItems] = useState([]);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [remediation, setRemediation] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const remediationsList = useRemediationsList();

  const {
    result,
    /*loading, error,*/ fetchAllIds,
    refetch: fetchRemediations,
  } = useRemediationsQuery(getRemediations(axios), {
    useTableState: true,
  });
  const handleSelectionChange = (newSelectedItems) => {
    setSelectedItems(newSelectedItems);
  };

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

  const handleBulkArchiveClick = async (selectedIds) => {
    try {
      const archivePromises = selectedIds.map((remId) =>
        archiveRemediation({ id: remId })
      );
      await Promise.all(archivePromises);
      dispatchNotification({
        variant: 'info',
        title: `Archived playbooks`,
        dismissable: true,
        autoDismiss: true,
      });

      fetchRemediations();
      setSelectedItems([]);
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

  const handleBulkUnArchiveClick = async (selectedIds) => {
    try {
      const archivePromises = selectedIds.map((remId) =>
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
      setSelectedItems([]);
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
  const { fetch: deleteRem } = useRemediationsQuery(deleteRemediation(axios), {
    skip: true,
  });
  const handleDeleteClick = async (itemId) => {
    //TODO: This does not retrigger the table as expected
    await deleteRem({ id: itemId }).then(() => {
      dispatchNotification({
        title: `Succesfully deleted remediation plan`,
        description: '',
        variant: 'success',
        dismissable: true,
        autoDismiss: true,
      });
      fetchRemediations();
    });
  };

  const { fetch: deleteReList } = useRemediationsQuery(
    deleteRemediationList(axios),
    {
      skip: true,
    }
  );
  const handleBulkDeleteClick = async () => {
    await deleteReList({ remediation_ids: selectedItems }).then(() => {
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

  const handleDownloadClick = async (itemId) => {
    await download([itemId], result.data, dispatch);
  };

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
      <RemediationsTable
        items={
          showArchived
            ? result?.data
            : result?.data.filter((item) => item.archived === false)
        }
        total={result?.meta?.total}
        columns={[...columns]}
        filters={{
          filterConfig: [
            ...remediationNameFilter,
            ...LastExecutedFilter,
            ...ExecutionStatusFilter,
            //TODO: Implement Calander Filter
            // ...CreatedFilter(),
            ...LastModified,
          ],
        }}
        selectedItems={selectedItems}
        options={{
          sortBy: {
            index: 6,
            direction: 'desc',
          },
          itemIdsInTable: fetchAllIds,
          manageColumns: true,
          onSelect: handleSelectionChange,
          itemIdsOnPage: result?.data.map(({ id }) => id),
          total: result?.meta?.total,
          actions: [
            {
              label: 'Archive',
              onClick: () => {
                handleBulkArchiveClick(selectedItems);
              },
            },
            {
              label: 'Unarchive',
              onClick: () => {
                handleBulkUnArchiveClick(selectedItems);
              },
            },
            {
              label: 'Delete',
              onClick: () => {
                handleBulkDeleteClick();
              },
            },
            {
              label: `${showArchived ? 'Hide' : 'Show'} archived`,
              onClick: () => {
                setShowArchived(!showArchived);
              },
            },
          ],
          dedicatedAction: () =>
            DownloadPlaybookButton(selectedItems, result?.data, dispatch),
        }}
        actions={[
          {
            title: 'Archive',
            onClick: (_event, _index, item) => {
              handleArchiveClick(item.itemId, item.rowData.name);
            },
          },
          {
            title: 'Download',
            onClick: (_event, _index, { itemId }) => {
              handleDownloadClick(itemId);
            },
          },
          {
            title: 'Rename',
            onClick: (_event, _index, item) => {
              let remediationDetails = {
                ...item.rowData,
                itemId: item.itemId,
              };
              setRemediation(remediationDetails);
              setIsRenameModalOpen(true);
            },
          },
          {
            title: 'Delete',
            onClick: (_event, _index, { itemId }) => {
              handleDeleteClick(itemId);
            },
          },
        ]}
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
