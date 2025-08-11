import React, { useMemo } from 'react';
import { Modal, ModalVariant } from '@patternfly/react-core/deprecated';
import PropTypes from 'prop-types';
import columns from './Columns';
import { actionsSystemFilter } from '../../Filters';
import {
  TableStateProvider,
  useSerialisedTableState,
} from 'bastilian-tabletools';
import TableEmptyState from '../../../OverViewPage/TableEmptyState';
import RemediationsTable from '../../../../components/RemediationsTable/RemediationsTable';

const SystemsModal = ({ systems, isOpen, onClose, actionName }) => {
  const serialisedTableState = useSerialisedTableState();

  const filteredSystems = useMemo(() => {
    const filterState = serialisedTableState?.filters;
    if (!filterState || Object.keys(filterState).length === 0) {
      return systems;
    }

    const searchTerm = filterState?.filter?.display_name;
    if (!searchTerm) {
      return systems;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();

    return systems.filter((item) =>
      item.display_name?.toLowerCase().includes(lowerSearchTerm),
    );
  }, [systems, serialisedTableState]);

  return (
    <Modal
      variant={ModalVariant.large}
      title={`Affected system${systems.length !== 1 ? 's' : ''}`}
      isOpen={isOpen}
      onClose={onClose}
      isFooterLeftAligned
    >
      <b>Action:</b> {actionName}
      <RemediationsTable
        aria-label="SystemsModalTable"
        ouiaId="SystemsModalTable"
        variant="compact"
        items={filteredSystems}
        total={filteredSystems?.length}
        columns={[...columns]}
        filters={{ filterConfig: [...actionsSystemFilter] }}
        options={{
          EmptyState: TableEmptyState,
          itemIdsInTable: () => filteredSystems.map(({ id }) => id),
          itemIdsOnPage: () => filteredSystems.map(({ id }) => id),
          total: filteredSystems?.length,
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

const SystemsModalContentProvider = (props) => {
  return (
    <TableStateProvider>
      <SystemsModal {...props} />
    </TableStateProvider>
  );
};
export default SystemsModalContentProvider;
