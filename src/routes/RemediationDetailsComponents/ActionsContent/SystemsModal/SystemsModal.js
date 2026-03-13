import React from 'react';
import { Modal, ModalVariant } from '@patternfly/react-core/deprecated';
import PropTypes from 'prop-types';
import columns from './Columns';
// import { actionsSystemFilter } from '../../Filters';
import TableEmptyState from '../../../OverViewPage/TableEmptyState';
import RemediationsTable from '../../../../components/RemediationsTable/RemediationsTable';
import useRemediations from '../../../../Utilities/Hooks/api/useRemediations';
import { TableStateProvider } from 'bastilian-tabletools';

const SystemsModal = ({
  remediationId,
  issueId,
  isOpen,
  onClose,
  actionName,
}) => {
  const {
    result: systems,
    loading: systemsLoading,
    fetchAllIds,
  } = useRemediations('getRemediationIssueSystems', {
    skip: !isOpen || !remediationId || !issueId,
    useTableState: true,
    params: {
      id: remediationId,
      issue: issueId,
    },
  });

  const systemsData = systems?.data || [];
  const totalSystems = systems?.meta?.total ?? systemsData?.length ?? 0;

  return (
    <Modal
      variant={ModalVariant.large}
      title={`Affected system${totalSystems !== 1 ? 's' : ''}`}
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
        total={totalSystems}
        columns={[...columns]}
        // filters={{ filterConfig: [...actionsSystemFilter] }}
        options={{
          EmptyState: TableEmptyState,
          itemIdsInTable: fetchAllIds,
          itemIdsOnPage: () => systemsData?.map(({ id }) => id) || [],
          total: totalSystems,
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
  <TableStateProvider isNewContext>
    <SystemsModal {...props} />
  </TableStateProvider>
);

export default SystemsModalProvider;
