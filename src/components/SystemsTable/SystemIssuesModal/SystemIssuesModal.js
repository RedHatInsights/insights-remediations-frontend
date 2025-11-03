import React from 'react';
import { Modal, ModalVariant } from '@patternfly/react-core/deprecated';
import PropTypes from 'prop-types';
import columns from './Columns';
import { issueNameFilter } from './Filters';
import TableEmptyState from '../../../routes/OverViewPage/TableEmptyState';
import RemediationsTable from '../../RemediationsTable/RemediationsTable';
import useRemediationsQuery from '../../../api/useRemediationsQuery';
import { getRemediationSystemIssues } from '../../../routes/api';
import { TableStateProvider } from 'bastilian-tabletools';

const SystemIssuesModal = ({
  remediationId,
  systemId,
  isOpen,
  onClose,
  systemName,
}) => {
  const { result: issues, loading: issuesLoading } = useRemediationsQuery(
    getRemediationSystemIssues,
    {
      skip: !isOpen || !remediationId || !systemId,
      useTableState: true,
      params: {
        id: remediationId,
        system: systemId,
      },
    },
  );

  const issuesData = issues?.data || [];

  return (
    <Modal
      variant={ModalVariant.large}
      title={`Action${issuesData?.length !== 1 ? 's' : ''}`}
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
        total={issuesData?.length}
        columns={[...columns]}
        filters={{ filterConfig: [...issueNameFilter] }}
        options={{
          EmptyState: TableEmptyState,
          itemIdsInTable: () => issuesData?.map(({ id }) => id) || [],
          itemIdsOnPage: () => issuesData?.map(({ id }) => id) || [],
          total: issuesData?.length || 0,
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
  systemName: PropTypes.string,
};

const SystemIssuesModalProvider = (props) => (
  <TableStateProvider>
    <SystemIssuesModal {...props} />
  </TableStateProvider>
);

export default SystemIssuesModalProvider;
