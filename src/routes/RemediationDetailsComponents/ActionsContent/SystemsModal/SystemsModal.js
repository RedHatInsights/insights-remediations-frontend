import React from 'react';
import { Modal, ModalVariant } from '@patternfly/react-core/deprecated';
import PropTypes from 'prop-types';
import columns from './Columns';
import { actionsSystemFilter } from '../../Filters';
import TableEmptyState from '../../../OverViewPage/TableEmptyState';
import RemediationsTable from '../../../../components/RemediationsTable/RemediationsTable';
import useRemediationsQuery from '../../../../api/useRemediationsQuery';
import { getRemediationIssueSystems } from '../../../api';
import { TableStateProvider } from 'bastilian-tabletools';

const SystemsModal = ({
  remediationId,
  issueId,
  isOpen,
  onClose,
  actionName,
}) => {
  const { result: systems, loading: systemsLoading } = useRemediationsQuery(
    getRemediationIssueSystems,
    {
      skip: !isOpen || !remediationId || !issueId,
      useTableState: true,
      params: {
        id: remediationId,
        issue_id: issueId,
      },
    },
  );

  const systemsData = systems?.data || [];

  return (
    <Modal
      variant={ModalVariant.large}
      title={`Affected system${systemsData?.length !== 1 ? 's' : ''}`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <b>Action:</b> {actionName}
      <RemediationsTable
        aria-label="SystemsModalTable"
        ouiaId="SystemsModalTable"
        variant="compact"
        loading={systemsLoading}
        items={systemsData}
        total={systemsData?.length}
        columns={[...columns]}
        filters={{ filterConfig: [...actionsSystemFilter] }}
        options={{
          EmptyState: TableEmptyState,
          itemIdsInTable: () => systemsData?.map(({ id }) => id) || [],
          itemIdsOnPage: () => systemsData?.map(({ id }) => id) || [],
          total: systemsData?.length || 0,
        }}
      />
    </Modal>
  );
};

SystemsModal.propTypes = {
  remediationId: PropTypes.string.isRequired,
  issueId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  actionName: PropTypes.string,
};

const SystemsModalProvider = (props) => (
  <TableStateProvider>
    <SystemsModal {...props} />
  </TableStateProvider>
);

export default SystemsModalProvider;
