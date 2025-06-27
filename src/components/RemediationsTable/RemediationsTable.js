import React from 'react';
import {
  filtersSerialiser,
  paginationSerialiser,
  sortSerialiser,
} from './serealisers';
import propTypes from 'prop-types';
import { TableToolsTable } from 'bastilian-tabletools';
/**
 * This component serves as a place to either use the non-async TableTools or the AsyncTableTools
 * And allow preparing the AsyncTableToolsTable props/options common across tables in Remediations
 *
 *  @param   {object}               props Component props
 *
 *  @returns {AsyncTableToolsTable}       Returns either a Async TableToolsTable
 *
 *  @category Remediations
 *
 */
const RemediationsTable = (props) => {
  return (
    <TableToolsTable
      {...props}
      options={{
        serialisers: {
          filters: filtersSerialiser,
          sort: sortSerialiser,
          pagination: paginationSerialiser,
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
