import React, { useMemo } from 'react';
import { Modal, ModalVariant } from '@patternfly/react-core/deprecated';
import PropTypes from 'prop-types';
import columns from './Columns';
import { issueNameFilter } from './Filters';
import {
  TableStateProvider,
  useSerialisedTableState,
} from 'bastilian-tabletools';
import TableEmptyState from '../../../routes/OverViewPage/TableEmptyState';
import RemediationsTable from '../../RemediationsTable/RemediationsTable';
import useRemediationsQuery from '../../../api/useRemediationsQuery';
import { getRemediationSystemIssues } from '../../../routes/api';

const SystemIssuesModal = ({
  remediationId,
  systemId,
  isOpen,
  onClose,
  systemName,
}) => {
  const serialisedTableState = useSerialisedTableState();

  const { result: issues, loading: issuesLoading } = useRemediationsQuery(
    getRemediationSystemIssues,
    {
      skip: !isOpen || !remediationId || !systemId,
      params: {
        id: remediationId,
        system: systemId,
      },
    },
  );

  const filteredIssues = useMemo(() => {
    const issuesData = issues?.data || [];
    const filterState = serialisedTableState?.filters;

    if (!filterState || Object.keys(filterState).length === 0) {
      return issuesData;
    }

    const searchTerm = filterState?.filter?.description;
    if (!searchTerm) {
      return issuesData;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();

    return issuesData.filter((item) =>
      item.description?.toLowerCase().includes(lowerSearchTerm),
    );
  }, [issues, serialisedTableState]);

  return (
    <Modal
      variant={ModalVariant.large}
      title={`Action${filteredIssues?.length !== 1 ? 's' : ''}`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <b>System:</b> {systemName}
      <RemediationsTable
        aria-label="SystemIssuesModalTable"
        ouiaId="SystemIssuesModalTable"
        variant="compact"
        loading={issuesLoading}
        items={filteredIssues}
        total={filteredIssues?.length}
        columns={[...columns]}
        filters={{ filterConfig: [...issueNameFilter] }}
        options={{
          EmptyState: TableEmptyState,
          itemIdsInTable: () => filteredIssues?.map(({ id }) => id) || [],
          itemIdsOnPage: () => filteredIssues?.map(({ id }) => id) || [],
          total: filteredIssues?.length || 0,
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

const SystemIssuesModalContentProvider = (props) => {
  return (
    <TableStateProvider isNewContext>
      <SystemIssuesModal {...props} />
    </TableStateProvider>
  );
};

export default SystemIssuesModalContentProvider;
