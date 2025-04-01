import React, { useState } from 'react';
// import useRemedations from '../Utilities/Hooks/api/useRemediations';
import columns from './Columns';
import TableStateProvider from '../Frameworks/AsyncTableTools/AsyncTableTools/components/TableStateProvider';
import useRemediationsQuery from '../api/useRemediationsQuery';
import { API_BASE } from '../config';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import RemediationsTable from '../components/RemediationsTable/RemediationsTable';
import {
  ActionsFilter,
  CreatedFilter,
  ExecutionStatusFilter,
  LastExecutedFilter,
  LastModified,
  remediationNameFilter,
  SystemsFilter,
} from './Filters';
import { DownloadPlaybookButton } from '../Utilities/DownloadPlaybookButton';
import { useDispatch } from 'react-redux';

const getRemediations = (axios) => (params) => {
  return axios.get(`${API_BASE}/remediations`, { params });
};

export const OverViewPage = () => {
  const dispatch = useDispatch();
  const axios = useAxiosWithPlatformInterceptors();
  const [selectedItems, setSelectedItems] = useState([]);
  const { result, /*loading, error,*/ fetchAllIds } = useRemediationsQuery(
    getRemediations(axios),
    {
      useTableState: true,
    }
  );
  const handleSelectionChange = (newSelectedItems) => {
    setSelectedItems(newSelectedItems);
  };

  return (
    <RemediationsTable
      items={result?.data}
      total={result?.meta?.total}
      columns={[...columns]}
      filters={{
        filterConfig: [
          ...remediationNameFilter,
          ...LastExecutedFilter,
          ...ExecutionStatusFilter,
          ...ActionsFilter,
          ...SystemsFilter,
          ...CreatedFilter,
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
    />
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
