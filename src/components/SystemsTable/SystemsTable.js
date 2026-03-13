import React, {
  useEffect,
  useRef,
  useState,
  Fragment,
  useMemo,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { InventoryTable } from '@redhat-cloud-services/frontend-components/Inventory';
import { remediationSystems } from '../../store/reducers';
import promiseMiddleware from 'redux-promise-middleware';
import ReducerRegistry from '@redhat-cloud-services/frontend-components-utilities/ReducerRegistry';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { Button } from '@patternfly/react-core';
import './SystemsTable.scss';
import RemoveSystemModal from './RemoveSystemModal';
import {
  fetchInventoryData,
  fetchAllRemediationSystems,
  mergedColumns,
  calculateChecked,
} from './helpers';
import systemsColumns from './Columns';
import useBulkSelect from './useBulkSelect';
import useOnConfirm from './useOnConfirm';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import useRemediations from '../../Utilities/Hooks/api/useRemediations';
import { deleteRemediationSystems } from '../../routes/api';
import { selectEntity } from '../../actions';

const SystemsTableWrapper = ({
  remediation,
  registry,
  refreshRemediation,
  connectedData,
  areDetailsLoading,
  refetchConnectionStatus,
}) => {
  const inventory = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const systemsRef = useRef();
  const configRef = useRef({});
  const activeSystem = useRef(undefined);
  const [refreshKey, setRefreshKey] = useState(0); // Used as key prop for InventoryTable
  const [totalCount, setTotalCount] = useState(0);
  const addNotification = useAddNotification();
  const dispatch = useDispatch();
  const selected = useSelector(
    ({ entities }) => entities?.selected || new Map(),
  );
  const loaded = useSelector(({ entities }) => entities?.loaded);
  const rows = useSelector(({ entities }) => entities?.rows);

  const { fetch: fetchSystems } = useRemediations('getRemediationSystems', {
    skip: true,
  });

  const clearSelection = useCallback(() => {
    if (selected && selected.size > 0) {
      Array.from(selected.keys()).forEach((id) => {
        dispatch(selectEntity(id, false));
      });
    }
  }, [selected, dispatch]);

  const reloadTable = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    systemsRef.current = [];
  }, []);

  useEffect(() => {
    systemsRef.current = rows || [];
  }, [rows]);

  const onConfirm = useOnConfirm({
    selected,
    activeSystem,
    deleteRemediationSystems,
    remediation,
    refreshRemediation: async () => {
      await refreshRemediation();
    },
    refetchConnectionStatus,
    setIsOpen,
    addNotification,
    clearSelection,
    reloadTable,
  });

  const fetchAllSystems = useCallback(
    () =>
      fetchAllRemediationSystems(
        fetchSystems,
        remediation.id,
        configRef.current,
      ),
    [fetchSystems, remediation.id],
  );

  const bulkSelect = useBulkSelect({
    systemsRef,
    rows,
    selected,
    loaded,
    calculateChecked,
    totalCount,
    fetchAllSystems,
  });

  const actions = useMemo(
    () => [
      {
        title: 'Remove',
        onClick: (_event, _index, { id, display_name }) => {
          activeSystem.current = {
            id,
            display_name,
          };
          setIsOpen(true);
        },
      },
    ],
    [],
  );

  const columns = useMemo(
    () => (defaultColumns) =>
      mergedColumns(defaultColumns, systemsColumns(remediation.id)),
    [remediation.id],
  );

  return (
    !areDetailsLoading && (
      <InventoryTable
        key={refreshKey}
        variant="compact"
        ref={inventory}
        isLoading={areDetailsLoading}
        showTags
        noDetail
        hideFilters={{
          all: true,
          name: false,
        }}
        tableProps={{
          canSelectAll: false,
        }}
        columns={columns}
        bulkSelect={bulkSelect}
        getEntities={async (_i, config, _hasItems, defaultGetEntities) => {
          configRef.current = config || {};
          const result = await fetchInventoryData(
            config,
            fetchSystems,
            remediation.id,
            defaultGetEntities,
            connectedData,
          );
          setTotalCount(result?.total ?? 0);
          return result;
        }}
        onLoad={({ INVENTORY_ACTION_TYPES, mergeWithEntities }) => {
          registry?.register?.({
            ...mergeWithEntities(remediationSystems(INVENTORY_ACTION_TYPES)),
          });
        }}
        actions={actions}
      >
        {loaded && (
          <Button
            variant="secondary"
            onClick={() => setIsOpen(true)}
            isDisabled={selected.size === 0}
          >
            Remove
          </Button>
        )}
        <RemoveSystemModal
          isOpen={isOpen}
          onConfirm={onConfirm}
          selected={
            selected.size > 0
              ? Array.from(selected, ([, value]) => value)
              : [activeSystem.current]
          }
          onClose={() => {
            activeSystem.current = undefined;
            setIsOpen(false);
          }}
          remediationName={remediation.name}
        />
      </InventoryTable>
    )
  );
};

const SystemsTable = (props) => {
  const [registry, setRegistry] = useState();
  useEffect(() => {
    setRegistry(
      new ReducerRegistry(
        {
          selected: new Map(),
        },
        [promiseMiddleware],
      ),
    );
  }, []);

  return registry ? (
    <Provider store={registry.store}>
      <SystemsTableWrapper registry={registry} {...props} />
    </Provider>
  ) : (
    <Fragment />
  );
};

SystemsTable.propTypes = {
  remediation: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  }),
};

SystemsTableWrapper.propTypes = {
  ...SystemsTable.propTypes,
  registry: PropTypes.shape({
    register: PropTypes.func,
  }),
  refreshRemediation: PropTypes.func,
  connectedData: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.shape()),
    PropTypes.number,
  ]),
  areDetailsLoading: PropTypes.bool,
  refetchConnectionStatus: PropTypes.func,
};

export default SystemsTable;
