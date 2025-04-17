import React from 'react';
import RemediationsTable from '../../components/RemediationsTable/RemediationsTable';
import PropTypes from 'prop-types';
import columns from './Columns';
import { emptyRows } from '../../Frameworks/AsyncTableTools/AsyncTableTools/hooks/useTableView/views/helpers';
import { Button } from '@patternfly/react-core';
import TableStateProvider from '../../Frameworks/AsyncTableTools/AsyncTableTools/components/TableStateProvider';
import useRemediationTableState from '../../api/useRemediationTableState';
import { API_BASE } from '../../config';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import useRemediationsQuery from '../../api/useRemediationsQuery';
import useRemediationFetchExtras from '../../api/useRemediationFetchExtras';
import { useRawTableState } from '../../Frameworks/AsyncTableTools/AsyncTableTools/hooks/useTableState';
import { useParams } from 'react-router-dom';
import { dispatchNotification } from '../../Utilities/dispatcher';

const deleteIssues = (axios) => (params) => {
  return axios({
    method: 'delete',
    url: `${API_BASE}/remediations/${params.id}/issues`,
    data: {
      issue_ids: params.issue_ids,
    },
  });
};

const ActionsContent = ({ remediationDetails, refetch }) => {
  const axios = useAxiosWithPlatformInterceptors();
  const { id } = useParams();

  // console.log(actions, 'actions here');
  const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  const { fetchBatched: deleteActions } = useRemediationsQuery(
    deleteIssues(axios),
    {
      skip: true,
      batched: true,
    }
  );
  const { fetchQueue } = useRemediationFetchExtras({
    fetch: deleteActions,
  });

  const handleDelete = async (selected) => {
    const chunks = chunkArray(selected, 100);
    const queue = chunks.map((chunk) => ({
      id,
      issue_ids: chunk,
    }));
    return await fetchQueue(queue);
  };
  //search filter
  //systems cell modal

  const { params } = useRemediationTableState(true);
  const tableState = useRawTableState();
  const currentlySelected = tableState?.selected;

  return (
    <section
      className={'pf-v5-l-page__main-section pf-v5-c-page__main-section'}
    >
      <RemediationsTable
        aria-label="ActionsTable"
        ouiaId="ActionsTable"
        items={remediationDetails?.issues?.slice(
          params?.offset || 0,
          params?.limit + params?.offset || 10
        )}
        total={remediationDetails?.issues?.length}
        columns={[...columns]}
        options={{
          onSelect: () => '',
          itemIdsInTable: remediationDetails?.issues?.map(({ id }) => id),
          itemIdsOnPage: remediationDetails?.issues?.slice(
            params?.offset || 0,
            params?.limit + params?.offset || 10
          ),
          total: remediationDetails?.issues?.length,
          actionResolver: () => {
            return [
              {
                title: 'Remove action',
                onClick: (_event, _index, { item }) => {
                  handleDelete([item.id]).then(() => {
                    dispatchNotification({
                      title: `Removed 1 action from ${remediationDetails.name}`,
                      description: '',
                      variant: 'success',
                      dismissable: true,
                      autoDismiss: true,
                    }).catch(() => {
                      dispatchNotification({
                        title: `Unable to remove action `,
                        description: '',
                        variant: 'danger',
                        dismissable: true,
                        autoDismiss: true,
                      });
                    });
                    refetch();
                  });
                },
              },
            ];
          },
          dedicatedAction: () => (
            <Button
              variant="secondary"
              onClick={() =>
                handleDelete(currentlySelected)
                  .then(() => {
                    dispatchNotification({
                      title: `Removed ${currentlySelected?.length} action(s) from ${remediationDetails.name}`,
                      description: '',
                      variant: 'success',
                      dismissable: true,
                      autoDismiss: true,
                    });
                    refetch();
                  })
                  .catch(() => {
                    dispatchNotification({
                      title: `Unable to remove action(s) `,
                      description: '',
                      variant: 'danger',
                      dismissable: true,
                      autoDismiss: true,
                    });
                  })
              }
            >
              Remove Action
            </Button>
          ),
          emptyRows: emptyRows(columns.length),
        }}
      />
    </section>
  );
};

ActionsContent.propTypes = {
  remediationDetails: PropTypes.object,
  refetch: PropTypes.func,
};

const ActionsContentProvider = (props) => {
  return (
    <TableStateProvider>
      <ActionsContent {...props} />
    </TableStateProvider>
  );
};

export default ActionsContentProvider;
