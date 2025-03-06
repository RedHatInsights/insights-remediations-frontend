import React, { useEffect } from 'react';
import OverViewTable from '../components/OverViewTable/OverViewTable';
// import useRemedations from '../Utilities/Hooks/api/useRemediations';
import columns from './Columns';
import TableStateProvider from '../Frameworks/AsyncTableTools/AsyncTableTools/components/TableStateProvider';
import useRemediationsQuery from '../api/useRemediationsQuery';
import { getRemediations } from '../api';

export const OverViewPage = () => {
  // const { data } = useRemedations();
  //TODO: This should return the plain result - change use remediations query to pass on params from tablestate
  const { data } = useRemediationsQuery(getRemediations);
  console.log(data, ' data here');

  return (
    <OverViewTable items={data} total={data?.length} columns={[...columns]} />
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
