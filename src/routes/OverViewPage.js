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

const getRemediations = (axios) => (params) => {
  return axios.get(`${API_BASE}/remediations`, { params });
};

export const OverViewPage = () => {
  const axios = useAxiosWithPlatformInterceptors();
  const [selectedItems, setSelectedItems] = useState([]);
  const { data, meta, fetchAllIds } = useRemediationsQuery(
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
      items={data}
      total={meta?.total}
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
        itemIdsInTable: fetchAllIds,
        manageColumns: true,
        onSelect: handleSelectionChange,
        itemIdsOnPage: data,
        identifier: 'id',
        preselected: data && data[0]?.id,
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
