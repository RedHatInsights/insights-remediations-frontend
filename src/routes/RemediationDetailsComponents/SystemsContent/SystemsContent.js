import React, { useMemo, useState } from 'react';
import { TableStateProvider } from 'bastilian-tabletools';
import { Button } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import RemediationsTable from '../../../components/RemediationsTable/RemediationsTable';
import { emptyRows } from '../../../Frameworks/AsyncTableTools/AsyncTableTools/hooks/useTableView/views/helpers';
import baseColumns from './Columns';
import useRemediationsQuery from '../../../api/useRemediationsQuery';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { useRawTableState } from '../../../Frameworks/AsyncTableTools/AsyncTableTools/hooks/useTableState';
import ConfirmationDialog from '../../../components/ConfirmationDialog';
import { dispatchNotification } from '../../../Utilities/dispatcher';
import useStateCallbacks from '../../../Frameworks/AsyncTableTools/AsyncTableTools/hooks/useTableState/hooks/useStateCallbacks';
import chunk from 'lodash/chunk';
import { useParams } from 'react-router-dom';
import useRemediationFetchExtras from '../../../api/useRemediationFetchExtras';
import { API_BASE } from '../../../config';
import ActionsModal from './ActionsModal/ActionsModal';
import { systemNameFilter } from '../Filters';

const getHostTags = (axios) => (params) => {
  return axios.get(`/api/inventory/v1/hosts/${params.host_id_list}/tags`);
};
const getHostOS = (axios) => (params) => {
  return axios.get(
    `/api/inventory/v1/hosts/${params.host_id_list}/system_profile`,
  );
};

const deleteIssues = (axios) => (params) => {
  return axios({
    method: 'delete',
    url: `${API_BASE}/remediations/${params.id}/systems`,
    data: {
      system_ids: params.system_ids,
    },
  });
};
//TODO: tags modal -> may use v1 table until this is resolved
//TODO: figure out loading while merging is happening
const SystemsContent = ({ remediationDetails, remediationStatus, refetch }) => {
  const axios = useAxiosWithPlatformInterceptors();
  const tableState = useRawTableState();
  const callbacks = useStateCallbacks();
  const { id } = useParams();
  const currentlySelected = tableState?.selected;
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [actionsToShow, setActionsToShow] = useState([]);
  const [system, setSystem] = useState();
  const [rowSystemName, setRowSystemName] = useState('');
  const allSystems = remediationDetails.issues.flatMap(
    (issue) => issue.systems,
  );
  const systemIds = allSystems.map((s) => s.id);

  const { result: hostTags, isLoading: tagsLoading } = useRemediationsQuery(
    getHostTags(axios),
    {
      params: { host_id_list: systemIds },
    },
  );
  const { result: hostOs, isLoading: hostLoading } = useRemediationsQuery(
    getHostOS(axios),
    {
      params: { host_id_list: systemIds },
    },
  );
  const loadingProfile = tagsLoading || hostLoading;

  const { fetchBatched: deleteSystems } = useRemediationsQuery(
    deleteIssues(axios),
    {
      skip: true,
      batched: true,
    },
  );
  const { fetchQueue } = useRemediationFetchExtras({
    fetch: deleteSystems,
  });

  const mergedSystems = useMemo(() => {
    // Manually count how many actions each system appears in
    const counts = {};
    allSystems.forEach((sys) => {
      counts[sys.id] = (counts[sys.id] || 0) + 1;
    });

    const statusMap = {};
    const execMap = {};
    (remediationStatus?.connectedData || []).forEach((group) => {
      group.system_ids.forEach((id) => {
        statusMap[id] = group.connection_status;
        execMap[id] = group.executor_type;
      });
    });

    // merge everything from 4 end points as we need info from 2 remediation and 2 inv endpoints
    const byId = {};
    allSystems.forEach((system) => {
      if (!byId[system.id]) {
        const osEntry = hostOs?.results?.find(
          (h) => h.id === system.id,
        )?.system_profile;
        const tagsForThis = hostTags?.results?.[system.id] || [];

        byId[system.id] = {
          ...system,
          actionCount: counts[system.id],
          system_profile: osEntry,
          tags: tagsForThis,
          connection_status: statusMap[system.id] ?? 'Not configured',
          executor_type: execMap[system.id] ?? 'None',
        };
      }
    });

    return Object.values(byId);
  }, [allSystems, hostTags, hostOs, remediationStatus]);

  //Eventually this will come before BE. This is just incase
  const nameFilter = tableState?.filters?.name?.[0] || '';
  const filteredSystems = useMemo(() => {
    if (!nameFilter) {
      return mergedSystems;
    }
    const lower = nameFilter.toLowerCase();
    return mergedSystems.filter((sys) =>
      sys.display_name?.toLowerCase().includes(lower),
    );
  }, [mergedSystems, nameFilter]);

  const tableColumns = useMemo(
    () =>
      baseColumns.map((col) => {
        if (col.exportKey === 'actionCount') {
          return {
            ...col,
            renderFunc: (
              _data,
              _id,
              { actionCount, id: systemId, display_name },
            ) => (
              <Button
                variant="link"
                style={{ padding: 0 }}
                onClick={() => {
                  const relatedActions = remediationDetails.issues.filter(
                    (issue) =>
                      issue.systems.some((system) => system.id === systemId),
                  );
                  setRowSystemName(display_name);
                  setActionsToShow(relatedActions);
                  setIsActionsModalOpen(true);
                }}
              >
                {`${actionCount} action${actionCount !== 1 ? 's' : ''}`}
              </Button>
            ),
          };
        }
        return col;
      }),
    [remediationDetails],
  );
  const handleDelete = async (selected) => {
    const chunks = chunk(selected, 100);
    const queue = chunks.map((chunk) => ({
      id,
      system_ids: chunk,
    }));
    return await fetchQueue(queue);
  };

  return (
    <section
      className={'pf-v5-l-page__main-section pf-v5-c-page__main-section'}
    >
      {isActionsModalOpen && (
        <ActionsModal
          isOpen={isActionsModalOpen}
          onClose={() => setIsActionsModalOpen(false)}
          actions={actionsToShow}
          systemName={rowSystemName}
        />
      )}
      {isDeleteModalOpen && (
        <ConfirmationDialog
          isOpen={isDeleteModalOpen}
          loading={loadingProfile}
          title={`Remove`}
          text="The selected systems will no longer be executed in this plan."
          confirmText="Remove"
          onClose={(confirm) => {
            setIsDeleteModalOpen(false);
            if (confirm) {
              const chopped = isBulkDelete ? currentlySelected : system;
              handleDelete(chopped)
                .then(() => {
                  dispatchNotification({
                    title: `Succesfully deleted systems`,
                    variant: 'success',
                    dismissable: true,
                    autoDismiss: true,
                  });
                  callbacks?.current?.resetSelection();
                  refetch();
                  setIsDeleteModalOpen(false);
                  setIsBulkDelete(false);
                })
                .catch(() => {
                  dispatchNotification({
                    title: `Failed to delete systems`,
                    variant: 'danger',
                    dismissable: true,
                    autoDismiss: true,
                  });
                });
            }
          }}
        />
      )}
      <RemediationsTable
        aria-label="ActionsTable"
        ouiaId="ActionsTable"
        items={filteredSystems}
        total={filteredSystems.length}
        columns={tableColumns}
        filters={{
          filterConfig: [...systemNameFilter],
        }}
        options={{
          //Known bug in asyncTableTools - needed for bulkSelect
          onSelect: () => '',
          itemIdsInTable: filteredSystems.map((i) => i.id),
          itemIdsOnPage: filteredSystems.map((i) => i.id),
          total: filteredSystems.length,
          actionResolver: () => {
            return [
              {
                title: 'Remove',
                onClick: (_event, _index, { item }) => {
                  setIsBulkDelete(false);
                  setSystem([item.id]);
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
          emptyRows: emptyRows(tableColumns.length),
        }}
      />
    </section>
  );
};
SystemsContent.propTypes = {
  remediationDetails: PropTypes.object.isRequired,
  refetch: PropTypes.func,
  remediationStatus: PropTypes.shape({
    connectedData: PropTypes.arrayOf(
      PropTypes.shape({
        connection_status: PropTypes.string,
        system_ids: PropTypes.arrayOf(PropTypes.string),
      }),
    ),
  }),
};

const SystemsContentProvider = (props) => (
  <TableStateProvider>
    <SystemsContent {...props} />
  </TableStateProvider>
);
export default SystemsContentProvider;
