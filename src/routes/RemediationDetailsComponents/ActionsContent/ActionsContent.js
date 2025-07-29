import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import columns from './Columns';
import { Button } from '@patternfly/react-core';
import useRemediationsQuery from '../../../api/useRemediationsQuery';
import useRemediationFetchExtras from '../../../api/useRemediationFetchExtras';
import { useParams } from 'react-router-dom';
import { dispatchNotification } from '../../../Utilities/dispatcher';
import chunk from 'lodash/chunk';
import ConfirmationDialog from '../../../components/ConfirmationDialog';
import { actionNameFilter } from '../Filters';
import SystemsModal from './SystemsModal/SystemsModal';
import {
  useTableState,
  TableStateProvider,
  useStateCallbacks,
  useSerialisedTableState,
} from 'bastilian-tabletools';
import TableEmptyState from '../../OverViewPage/TableEmptyState';

import { deleteIssues } from '../../api';
import RemediationsTable from '../../../components/RemediationsTable/RemediationsTable';

const ActionsContent = ({ remediationDetails, refetch, loading }) => {
  const { id } = useParams();
  const tableState = useTableState();
  const serialisedTableState = useSerialisedTableState();
  const currentlySelected = tableState?.selected;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [action, setAction] = useState();
  const [isSystemsModalOpen, setIsSystemsModalOpen] = useState(false);
  const [systemsToShow, setSystemsToShow] = useState([]);
  const [actionToShow, setActionToShow] = useState('');
  const { fetchBatched: deleteActions } = useRemediationsQuery(deleteIssues, {
    skip: true,
    batched: true,
  });
  const callbacks = useStateCallbacks();
  const { fetchQueue } = useRemediationFetchExtras({ fetch: deleteActions });

  const SystemsButton = ({
    systems = [],
    description,
    setActionToShow,
    setSystemsToShow,
    setIsSystemsModalOpen,
  }) => (
    <Button
      size="sm"
      style={{ padding: '0' }}
      variant="link"
      onClick={() => {
        setActionToShow(description);
        setSystemsToShow(systems);
        setIsSystemsModalOpen(true);
      }}
    >
      {`${systems.length} system${systems.length !== 1 ? 's' : ''}`}
    </Button>
  );
  SystemsButton.propTypes = {
    systems: PropTypes.array.isRequired,
    description: PropTypes.string,
    setActionToShow: PropTypes.func.isRequired,
    setSystemsToShow: PropTypes.func.isRequired,
    setIsSystemsModalOpen: PropTypes.func.isRequired,
  };

  const handleDelete = async (selected) => {
    const chunks = chunk(selected, 100);
    const queue = chunks.map((chunk) => ({
      id,
      issue_ids: chunk,
    }));
    return await fetchQueue(queue);
  };

  //Back end is currently working on filtering - This filter acts as a placeholder
  const allIssues = useMemo(
    () => remediationDetails?.issues ?? [],
    [remediationDetails?.issues],
  );

  const filteredIssues = useMemo(() => {
    const filterState = serialisedTableState?.filters;
    if (!filterState || Object.keys(filterState).length === 0) {
      return allIssues;
    }

    const searchTerm = filterState?.filter?.description;
    if (!searchTerm) {
      return allIssues;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return allIssues.filter((item) =>
      item.description?.toLowerCase().includes(lowerSearchTerm),
    );
  }, [allIssues, serialisedTableState]);

  const columnsWithSystemsButton = useMemo(() => {
    return columns.map((col) => {
      if (col.exportKey === 'system_count') {
        return {
          ...col,
          Component: (props) => {
            const rowData = props;
            return (
              <SystemsButton
                systems={rowData.systems || []}
                setActionToShow={setActionToShow}
                setSystemsToShow={setSystemsToShow}
                setIsSystemsModalOpen={setIsSystemsModalOpen}
                description={rowData.description}
              />
            );
          },
        };
      }
      return col;
    });
  }, []);

  return (
    <section className="pf-v5-l-page__main-section pf-v5-c-page__main-section">
      {isSystemsModalOpen && (
        <SystemsModal
          isOpen={isSystemsModalOpen}
          onClose={() => setIsSystemsModalOpen(false)}
          systems={systemsToShow}
          actionName={actionToShow}
        />
      )}
      {isDeleteModalOpen && (
        <ConfirmationDialog
          isOpen={isDeleteModalOpen}
          title={`Remove action${isBulkDelete ? 's' : ''}?`}
          text={
            isBulkDelete ? (
              'The selected actions will not be run when the remediation plan is executed. ' +
              'You can add them again later if needed.'
            ) : (
              <>
                The action <strong>{action?.[0]}</strong> will not be run when
                the remediation plan is executed. You can add it again later if
                needed.
              </>
            )
          }
          confirmText="Remove"
          onClose={async (confirm) => {
            const chopped = isBulkDelete ? currentlySelected : action;

            if (!confirm) {
              setIsDeleteModalOpen(false);
              return;
            }
            try {
              await handleDelete(chopped);
              dispatchNotification({
                title: 'Successfully deleted actions',
                variant: 'success',
                dismissable: true,
                autoDismiss: true,
              });
              await refetch();
              callbacks?.current?.resetSelection();
            } catch (err) {
              console.error(err);
              dispatchNotification({
                title: 'Failed to delete actions',
                variant: 'danger',
                dismissable: true,
                autoDismiss: true,
              });
            } finally {
              setIsDeleteModalOpen(false);
              setIsBulkDelete(false);
            }
          }}
        />
      )}
      <RemediationsTable
        aria-label="ActionsTable"
        ouiaId="ActionsTable"
        variant="compact"
        loading={loading}
        items={filteredIssues}
        total={filteredIssues?.length}
        columns={[...columnsWithSystemsButton]}
        filters={{
          filterConfig: [...actionNameFilter],
        }}
        options={{
          onSelect: () => '',
          itemIdsInTable: () => filteredIssues.map(({ id }) => id),
          itemIdsOnPage: () => filteredIssues.map(({ id }) => id),
          total: filteredIssues?.length,
          actionResolver: () => {
            return [
              {
                title: 'Remove',
                onClick: (_event, _index, { item }) => {
                  setIsBulkDelete(false);
                  setAction([item.id]);
                  setIsDeleteModalOpen(true);
                },
              },
            ];
          },
          dedicatedAction: () => (
            <Button
              variant="secondary"
              isDisabled={currentlySelected?.length === 0}
              onClick={() => {
                setIsBulkDelete(true);
                setIsDeleteModalOpen(true);
              }}
            >
              Remove
            </Button>
          ),
          EmptyState: TableEmptyState,
        }}
      />
    </section>
  );
};

ActionsContent.propTypes = {
  remediationDetails: PropTypes.object,
  refetch: PropTypes.func,
  loading: PropTypes.bool,
};

const ActionsContentProvider = (props) => (
  <TableStateProvider>
    <ActionsContent {...props} />
  </TableStateProvider>
);

export default ActionsContentProvider;
