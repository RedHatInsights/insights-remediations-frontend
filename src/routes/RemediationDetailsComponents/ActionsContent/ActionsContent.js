import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import columns from './Columns';
import { Button } from '@patternfly/react-core';
import useRemediationsQuery from '../../../api/useRemediationsQuery';
import useRemediationFetchExtras from '../../../api/useRemediationFetchExtras';
import { useParams } from 'react-router-dom';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import chunk from 'lodash/chunk';
import ConfirmationDialog from '../../../components/ConfirmationDialog';
import { actionNameFilter } from '../Filters';
import SystemsModal from './SystemsModal/SystemsModal';
import {
  useRawTableState,
  TableStateProvider,
  StaticTableToolsTable,
  useStateCallbacks,
} from 'bastilian-tabletools';
import TableEmptyState from '../../OverViewPage/TableEmptyState';

import { deleteIssues } from '../../api';

const ActionsContent = ({ remediationDetails, refetch, loading }) => {
  const { id } = useParams();
  const tableState = useRawTableState();
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
  const addNotification = useAddNotification();

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

  //Back end is currently working on filtering - This filter acts as a placegholder
  const allIssues = remediationDetails?.issues ?? [];
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
    <section className="pf-v6-l-page__main-section pf-v6-c-page__main-section">
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
              addNotification({
                title: 'Successfully deleted actions',
                variant: 'success',
                dismissable: true,
                autoDismiss: true,
              });
              refetch();
              callbacks?.current?.resetSelection();
            } catch (err) {
              console.error(err);
              addNotification({
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
      <StaticTableToolsTable
        aria-label="ActionsTable"
        ouiaId="ActionsTable"
        variant="compact"
        loading={loading}
        items={!loading ? allIssues : undefined}
        columns={[...columnsWithSystemsButton]}
        filters={{
          filterConfig: [...actionNameFilter],
        }}
        options={{
          manageColumns: true,
          onSelect: true,
          itemIdsInTable: () => allIssues.map(({ id }) => id),
          itemIdsOnPage: () => allIssues.map(({ id }) => id),
          tableProps: {
            variant: 'compact',
          },
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
