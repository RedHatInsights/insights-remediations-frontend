import React from 'react';
import { Modal, ModalVariant } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import TableStateProvider from '../../../../Frameworks/AsyncTableTools/AsyncTableTools/components/TableStateProvider';

import RemediationsTable from '../../../../components/RemediationsTable/RemediationsTable';
import columns from './Columns';
const ActionsModal = ({ actions, isOpen, onClose, systemName }) => {
  return (
    <Modal
      variant={ModalVariant.large}
      title={`Actions for system ${systemName}`}
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
