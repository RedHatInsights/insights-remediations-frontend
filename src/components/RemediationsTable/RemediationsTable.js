import React from 'react';
import {
  filtersSerialiser,
  paginationSerialiser,
  sortSerialiser,
} from './serealisers';
import propTypes from 'prop-types';
import AsyncTableToolsTable from '../../Frameworks/AsyncTableTools/AsyncTableTools/components/AsyncTableToolsTable';

/**
 * This component serves as a place to either use the non-async TableTools or the AsyncTableTools
 * And allow preparing the AsyncTableToolsTable props/options common across tables in Remediations
 *
 *  @param   {object}             props Component props
 *
 *  @returns {AsyncTableToolsTable}       Returns either a Async TableToolsTable
 *
 *  @category Remediations
 *
 */
const RemediationsTable = (props) => {
  return (
    <AsyncTableToolsTable
      {...props}
      options={{
        serialisers: {
          pagination: paginationSerialiser,
          filters: filtersSerialiser,
          sort: sortSerialiser,
        },
        ...props.options,
      }}
    />
  );
};

RemediationsTable.propTypes = {
  options: propTypes.object,
};

export default RemediationsTable;
