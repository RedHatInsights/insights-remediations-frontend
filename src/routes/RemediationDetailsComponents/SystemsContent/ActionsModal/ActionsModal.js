import React from 'react';
import { Modal, ModalVariant } from '@patternfly/react-core/deprecated';
import PropTypes from 'prop-types';
import { TableStateProvider } from 'bastilian-tabletools';

import RemediationsTable from '../../../../components/RemediationsTable/RemediationsTable';
import columns from './Columns';
const ActionsModal = ({ actions, isOpen, onClose }) => {
  return (
    <Modal
      variant={ModalVariant.large}
      title="Planned remediation actions"
      isOpen={isOpen}
      onClose={onClose}
      isFooterLeftAligned
    >
      <RemediationsTable
        aria-label="ActionsModalTable"
        ouiaId="ActionsModalTable"
        items={actions}
        total={actions?.length}
        columns={[...columns]}
      />
    </Modal>
  );
};

ActionsModal.propTypes = {
  actions: PropTypes.array,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  systemName: PropTypes.string,
};

const ActionsModalContentProvider = (props) => {
  return (
    <TableStateProvider>
      <ActionsModal {...props} />
    </TableStateProvider>
  );
};
export default ActionsModalContentProvider;
