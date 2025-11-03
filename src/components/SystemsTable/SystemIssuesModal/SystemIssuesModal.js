import React from 'react';
import { Modal, ModalVariant } from '@patternfly/react-core/deprecated';
import PropTypes from 'prop-types';
import columns from './Columns';
<<<<<<< HEAD
// import { issueNameFilter } from './Filters';
import TableEmptyState from '../../../routes/OverViewPage/TableEmptyState';
import RemediationsTable from '../../RemediationsTable/RemediationsTable';
import useRemediations from '../../../Utilities/Hooks/api/useRemediations';
=======
import { issueNameFilter } from './Filters';
import TableEmptyState from '../../../routes/OverViewPage/TableEmptyState';
import RemediationsTable from '../../RemediationsTable/RemediationsTable';
import useRemediationsQuery from '../../../api/useRemediationsQuery';
import { getRemediationSystemIssues } from '../../../routes/api';
>>>>>>> 26c832f (feat(tables): move tables from static to async)
import { TableStateProvider } from 'bastilian-tabletools';

const SystemIssuesModal = ({
  remediationId,
  systemId,
  isOpen,
  onClose,
  systemName,
}) => {
  const {
    result: issues,
    loading: issuesLoading,
    fetchAllIds,
  } = useRemediations('getRemediationSystemIssues', {
    skip: !isOpen || !remediationId || !systemId,
    useTableState: true,
    params: {
      id: remediationId,
      system: systemId,
    },
  });

  const issuesData = issues?.data || [];
  const totalIssues = issues?.meta?.total ?? issuesData?.length ?? 0;

  return (
    <Modal
      variant={ModalVariant.large}
      title={`Action${totalIssues !== 1 ? 's' : ''}`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <b>System:</b> {systemName}
      <RemediationsTable
        aria-label="SystemIssuesModalTable"
        ouiaId="SystemIssuesModalTable"
        variant="compact"
        loading={issuesLoading}
        items={issuesData}
        total={totalIssues}
        columns={[...columns]}
        // filters={{ filterConfig: [...issueNameFilter] }}
        options={{
          EmptyState: TableEmptyState,
          itemIdsInTable: fetchAllIds,
          itemIdsOnPage: () => issuesData?.map(({ id }) => id) || [],
          total: totalIssues,
        }}
      />
    </Modal>
  );
};

SystemIssuesModal.propTypes = {
  remediationId: PropTypes.string.isRequired,
  systemId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  systemName: PropTypes.string.isRequired,
};

const SystemIssuesModalProvider = (props) => (
  <TableStateProvider isNewContext>
    <SystemIssuesModal {...props} />
  </TableStateProvider>
);

export default SystemIssuesModalProvider;
