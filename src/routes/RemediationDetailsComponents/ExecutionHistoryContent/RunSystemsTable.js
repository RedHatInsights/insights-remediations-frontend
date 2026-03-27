import React from 'react';
import RemediationsTable from '../../../components/RemediationsTable/RemediationsTable';
import useColumns from './Columns';
import { systemFilter } from './Filter';
import PropTypes from 'prop-types';
import TableEmptyState from '../../OverViewPage/TableEmptyState';

const RunSystemsTable = ({ run, loading, total, viewLogColumn }) => {
  const columns = useColumns();
  const systems = run.systems ?? [];

  return (
    <RemediationsTable
      aria-label="ExecutionHistoryTable"
      ouiaId={`ExecutionHistory-${run.id}`}
      variant="compact"
      loading={loading}
      items={systems}
      total={total}
      columns={[...columns, viewLogColumn]}
      filters={{ filterConfig: [...systemFilter] }}
      options={{
        manageColumns: true,
        itemIdsOnPage: systems.map((s) => s.system_id),
        total,
        EmptyState: TableEmptyState,
      }}
    />
  );
};

RunSystemsTable.propTypes = {
  run: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  total: PropTypes.number.isRequired,
  viewLogColumn: PropTypes.object.isRequired,
};

export default RunSystemsTable;
