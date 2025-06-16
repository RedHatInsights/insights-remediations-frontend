import React from 'react';
import TableStateProvider from '../Frameworks/AsyncTableTools/AsyncTableTools/components/TableStateProvider';

/**
 * Wrap UI (or hook) in a minimal ATT provider so
 * useTableState / useAsyncTableTools have context in tests.
 *
 * @param   {React.ReactNode} ui             Component tree or element.
 * @param   {object}          providerProps  Optional overrides (tableId, pagination, emptyState, etc.).
 * @returns {React.ReactElement}
 */
export const withTableState = (ui, providerProps = {}) => (
  <TableStateProvider
    tableId="jest-table"
    pagination={false}
    {...providerProps}
  >
    {ui}
  </TableStateProvider>
);
