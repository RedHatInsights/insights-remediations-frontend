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

const updateRemediation = (axios) => (params) => {
  return axios.patch(`${API_BASE}/remediations/${params.id}`, {
    archived: true,
  });
};

const deleteRemediation = (axios) => (params) => {
  return axios.delete(`${API_BASE}/remediations/${params.id}`);
};

export const OverViewPage = () => {
  const dispatch = useDispatch();
  const axios = useAxiosWithPlatformInterceptors();
  const [selectedItems, setSelectedItems] = useState([]);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [remediation, setRemediation] = useState('');
  //TODO: implement toolbar filter with this var
  const [showArchived, setShowArchived] = useState(false);
  const remediationsList = useRemediationsList();

  //TODO: Hide archived plans unless user selects otherwise;
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
    updateRemediation(axios),
    {
      skip: true,
    }
  );
  const { fetch: deleteRem } = useRemediationsQuery(deleteRemediation(axios), {
    skip: true,
  });

  const handleArchiveClick = async (itemId, name) => {
    //TODO: This does not retrigger the table as expected
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
            // ...CreatedFilter,
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
          dedicatedAction: () =>
            DownloadPlaybookButton(selectedItems, result?.data, dispatch),
        }}
        actions={[
          {
            title: 'Archive',
            onClick: (_event, _index, item) => {
              console.log(item, 'item here');
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
