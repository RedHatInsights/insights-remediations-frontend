import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import columns from './Columns';
import { Button } from '@patternfly/react-core';
import useRemediations from '../../../Utilities/Hooks/api/useRemediations';
import useRemediationFetchExtras from '../../../api/useRemediationFetchExtras';
import { useParams } from 'react-router-dom';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import chunk from 'lodash/chunk';
import ConfirmationDialog from '../../../components/ConfirmationDialog';
// import { actionNameFilter } from '../Filters';
import SystemsModal from './SystemsModal/SystemsModal';
import {
  useRawTableState,
  useStateCallbacks,
  TableStateProvider,
} from 'bastilian-tabletools';
import TableEmptyState from '../../OverViewPage/TableEmptyState';
import RemediationsTable from '../../../components/RemediationsTable/RemediationsTable';

const ActionsContent = ({
  refetch,
  onOpenResolutionDrawer,
  selectedIssueForResolutionId,
}) => {
  const { id } = useParams();
  const tableState = useRawTableState();
  const currentlySelected = tableState?.selected;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [action, setAction] = useState();
  const [isSystemsModalOpen, setIsSystemsModalOpen] = useState(false);
  const [actionToShow, setActionToShow] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState('');

  const {
    result: issuesResult,
    loading: issuesLoading,
    refetch: refetchIssues,
    fetchAllIds,
  } = useRemediations('getRemediationIssues', {
    useTableState: true,
    params: { id },
  });

  const { fetchBatched: deleteActions } = useRemediations(
    'deleteRemediationIssues',
    {
      skip: true,
      batched: true,
    },
  );
  const callbacks = useStateCallbacks();
  const { fetchQueue } = useRemediationFetchExtras({ fetch: deleteActions });
  const addNotification = useAddNotification();
  const SystemsButton = ({
    systemCount,
    description,
    issueId,
    setActionToShow,
    setSelectedIssueId,
    setIsSystemsModalOpen,
  }) => (
    <Button
      size="sm"
      style={{ padding: '0' }}
      variant="link"
      onClick={() => {
        setActionToShow(description);
        setSelectedIssueId(issueId);
        setIsSystemsModalOpen(true);
      }}
    >
      {`${systemCount} system${systemCount > 1 ? 's' : ''}`}
    </Button>
  );
  SystemsButton.propTypes = {
    systemCount: PropTypes.number.isRequired,
    description: PropTypes.string,
    issueId: PropTypes.string.isRequired,
    setActionToShow: PropTypes.func.isRequired,
    setSelectedIssueId: PropTypes.func.isRequired,
    setIsSystemsModalOpen: PropTypes.func.isRequired,
  };

  const handleDelete = async (selected) => {
    const chunks = chunk(selected, 100);
    const queue = chunks.map((chunk) => ({
      id,
      issuesList: {
        issue_ids: chunk,
      },
    }));
    return await fetchQueue(queue);
  };

  const allIssues = useMemo(
    () => issuesResult?.data ?? [],
    [issuesResult?.data],
  );
  const totalIssues = issuesResult?.meta?.total ?? allIssues?.length ?? 0;

  const handleViewResolutionOptions = useCallback(
    (issueId) => {
      const issue = allIssues.find((i) => i.id === issueId);
      if (onOpenResolutionDrawer && issue) {
        onOpenResolutionDrawer(issue);
      }
    },
    [allIssues, onOpenResolutionDrawer],
  );

  const columnsWithSystemsButton = useMemo(() => {
    return columns.map((col) => {
      if (col.exportKey === 'system_count') {
        return {
          ...col,
          Component: (props) => {
            const rowData = props;
            return (
              <SystemsButton
                systemCount={rowData?.system_count}
                setActionToShow={setActionToShow}
                setSelectedIssueId={setSelectedIssueId}
                setIsSystemsModalOpen={setIsSystemsModalOpen}
                description={rowData.description}
                issueId={rowData.id}
              />
            );
          },
        };
      }
      if (col.exportKey === 'action') {
        return {
          ...col,
          Component: (props) => {
            const rowData = props;
            return (
              <col.Component
                {...rowData}
                onViewResolutionOptions={handleViewResolutionOptions}
                selectedIssueForResolutionId={selectedIssueForResolutionId}
              />
            );
          },
        };
      }
      return col;
    });
  }, [handleViewResolutionOptions, selectedIssueForResolutionId]);

  return (
    <section className="pf-v6-l-page__main-section pf-v6-c-page__main-section">
      {isSystemsModalOpen && (
        <SystemsModal
          remediationId={id}
          issueId={selectedIssueId}
          isOpen={isSystemsModalOpen}
          onClose={() => setIsSystemsModalOpen(false)}
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
              refetchIssues();
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
      <RemediationsTable
        aria-label="ActionsTable"
        ouiaId="ActionsTable"
        variant="compact"
        loading={issuesLoading}
        items={allIssues}
        total={totalIssues}
        columns={[...columnsWithSystemsButton]}
        // filters={{
        //   filterConfig: [...actionNameFilter],
        // }}
        options={{
          manageColumns: true,
          onSelect: true,
          itemIdsInTable: fetchAllIds,
          itemIdsOnPage: allIssues?.map(({ id }) => id),
          total: totalIssues,
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
  refetch: PropTypes.func,
  onOpenResolutionDrawer: PropTypes.func,
  selectedIssueForResolutionId: PropTypes.string,
};

const ActionsContentProvider = (props) => (
  <TableStateProvider>
    <ActionsContent {...props} />
  </TableStateProvider>
);

export default ActionsContentProvider;
