import React from 'react';
import { useRawTableState } from '../../../Frameworks/AsyncTableTools/AsyncTableTools/hooks/useTableState';
import RemediationsTable from '../../../components/RemediationsTable/RemediationsTable';
import columns from './Columns';
import { systemFilter } from './Filter';
import PropTypes from 'prop-types';
import { emptyRows } from '../../../Frameworks/AsyncTableTools/AsyncTableTools/hooks/useTableView/views/helpers';

const RunSystemsTable = ({ run, loading, viewLogColumn }) => {
  const tableState = useRawTableState();
  const nameFilter = tableState?.filters?.system?.[0]?.toLowerCase() ?? '';

  const filtered = nameFilter
    ? run.systems.filter((s) =>
        s.system_name.toLowerCase().includes(nameFilter),
      )
    : run.systems;
  return (
    <RemediationsTable
      aria-label="ExecutionHistoryTable"
      ouiaId={`ExecutionHistory-${run.id}`}
      variant="compact"
      loading={loading}
      items={filtered}
      total={filtered.length}
      columns={[...columns, viewLogColumn]}
      filters={{ filterConfig: [...systemFilter] }}
      options={{
        itemIdsOnPage: filtered.map((s) => s.system_id),
        total: filtered.length,
        emptyRows: emptyRows(columns.length + 1),
      }}
    />
  );
};

RunSystemsTable.propTypes = {
  run: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  viewLogColumn: PropTypes.object.isRequired,
};

export default RunSystemsTable;
