import React, { useMemo } from 'react';
import { Modal, ModalVariant } from '@patternfly/react-core';
import PropTypes from 'prop-types';

import TableStateProvider from '../../../Frameworks/AsyncTableTools/AsyncTableTools/components/TableStateProvider';
import RemediationsTable from '../../../components/RemediationsTable/RemediationsTable';
import columns from './Columns';
import { useRawTableState } from '../../../Frameworks/AsyncTableTools/AsyncTableTools/hooks/useTableState';
import useRemediationTableState from '../../../api/useRemediationTableState';
import { actionNameFilter } from '../Filters';

const SystemsModal = ({ systems, isOpen, onClose, actionName }) => {
  const tableState = useRawTableState();
  const { params } = useRemediationTableState(true);

  const nameFilter = tableState?.filters?.name?.[0] || '';
  const allIssues = systems || [];
  const filteredSystems = useMemo(() => {
    if (!nameFilter) {
      return allIssues;
    }
    return allIssues.filter((system) =>
      system?.display_name.includes(nameFilter)
    );
  }, [allIssues, nameFilter]);
  const start = params?.offset || 0;
  const end = (params?.limit || 10) + start;
  const pageOfSystems = filteredSystems.slice(start, end);

  return (
    <Modal
      variant={ModalVariant.large}
      title={`System${systems?.length > 1 ? 's' : ''} for action`}
      isOpen={isOpen}
      onClose={onClose}
      isFooterLeftAligned
    >
      <b>Action:</b> {actionName}
      <RemediationsTable
        aria-label="SystemsModalTable"
        ouiaId="SystemsModalTable"
        items={pageOfSystems}
        total={filteredSystems?.length}
        columns={[...columns]}
        filters={{
          filterConfig: [...actionNameFilter],
        }}
      />
    </Modal>
  );
};
SystemsModal.propTypes = {
  systems: PropTypes.array,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  actionName: PropTypes.string,
};

const SystemsContentProvider = (props) => {
  return (
    <TableStateProvider>
      <SystemsModal {...props} />
    </TableStateProvider>
  );
};
export default SystemsContentProvider;
