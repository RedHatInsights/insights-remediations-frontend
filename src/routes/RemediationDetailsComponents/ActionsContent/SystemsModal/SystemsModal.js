import React from 'react';
import { Modal, ModalVariant } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import columns from './Columns';
import { actionsSystemFilter } from '../../Filters';
import {
  TableStateProvider,
  StaticTableToolsTable,
} from 'bastilian-tabletools';
import TableEmptyState from '../../../OverViewPage/TableEmptyState';

const SystemsModal = ({ systems, isOpen, onClose, actionName }) => {
  return (
    <Modal
      variant={ModalVariant.large}
      title={`Affected system${systems.length !== 1 ? 's' : ''}`}
      isOpen={isOpen}
      onClose={onClose}
      isFooterLeftAligned
    >
      <b>Action:</b> {actionName}
      <StaticTableToolsTable
        aria-label="SystemsModalTable"
        ouiaId="SystemsModalTable"
        variant="compact"
        items={systems}
        columns={[...columns]}
        filters={{ filterConfig: [...actionsSystemFilter] }}
        options={{ EmptyState: TableEmptyState }}
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
