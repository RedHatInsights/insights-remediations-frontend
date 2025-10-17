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
import useRemediationsQuery from '../../../../api/useRemediationsQuery';
import { getRemediationIssueSystems } from '../../../api';

const SystemsModal = ({
  remediationId,
  issueId,
  isOpen,
  onClose,
  actionName,
}) => {
  const serialisedTableState = useSerialisedTableState();

  const { result: systems, loading: systemsLoading } = useRemediationsQuery(
    getRemediationIssueSystems,
    {
      skip: !isOpen || !remediationId || !issueId,
      params: {
        id: remediationId,
        issue_id: issueId,
      },
    },
  );
  console.log(systems, 'systems here in the modal');
  const filteredSystems = useMemo(() => {
    const systemsData = systems?.data || [];
    const filterState = serialisedTableState?.filters;

    if (!filterState || Object.keys(filterState).length === 0) {
      return systemsData;
    }

    const searchTerm = filterState?.filter?.display_name;
    if (!searchTerm) {
      return systemsData;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();

    return systemsData.filter((item) =>
      item.display_name?.toLowerCase().includes(lowerSearchTerm),
    );
  }, [systems, serialisedTableState]);

  return (
    <Modal
      variant={ModalVariant.large}
      title={`Affected system${filteredSystems?.length !== 1 ? 's' : ''}`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <b>Action:</b> {actionName}
      <RemediationsTable
        aria-label="SystemsModalTable"
        ouiaId="SystemsModalTable"
        variant="compact"
        loading={systemsLoading}
        items={filteredSystems}
        total={filteredSystems?.length}
        columns={[...columns]}
        filters={{ filterConfig: [...actionsSystemFilter] }}
        options={{
          EmptyState: TableEmptyState,
          itemIdsInTable: () => filteredSystems?.map(({ id }) => id) || [],
          itemIdsOnPage: () => filteredSystems?.map(({ id }) => id) || [],
          total: filteredSystems?.length || 0,
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

const SystemsModalContentProvider = (props) => {
  return (
    <TableStateProvider isNewContext>
      <SystemsModal {...props} />
    </TableStateProvider>
  );
};
export default SystemsModalContentProvider;
