import React, { useEffect, useRef, useState, Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';
import { InventoryTable } from '@redhat-cloud-services/frontend-components/Inventory';
import { remediationSystems } from '../../store/reducers';
import promiseMiddleware from 'redux-promise-middleware';
import ReducerRegistry from '@redhat-cloud-services/frontend-components-utilities/ReducerRegistry';
import { Provider, useSelector } from 'react-redux';
import { Button } from '@patternfly/react-core';
import { deleteSystems } from '../../actions';
import './SystemsTable.scss';
import RemoveSystemModal from './RemoveSystemModal';
import {
  calculateSystems,
  fetchInventoryData,
  mergedColumns,
  calculateChecked,
} from './helpers';
import systemsColumns from './Columns';
import useBulkSelect from './useBulkSelect';
import useOnConfirm from './useOnConfirm';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';

const SystemsTableWrapper = ({
  remediation,
  registry,
  refreshRemediation,
  connectedData,
  areDetailsLoading,
}) => {
  const inventory = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const systemsRef = useRef();
  const activeSystem = useRef(undefined);
  const [refreshKey, setRefreshKey] = useState(0);
  const addNotification = useAddNotification();
  const selected = useSelector(
    ({ entities }) => entities?.selected || new Map(),
  );
  const loaded = useSelector(({ entities }) => entities?.loaded);
  const rows = useSelector(({ entities }) => entities?.rows);

  useEffect(() => {
    systemsRef.current = calculateSystems(remediation);
    setRefreshKey((prev) => prev + 1);
  }, [remediation]);

  const onConfirm = useOnConfirm({
    selected,
    activeSystem,
    deleteSystems,
    remediation,
    refreshRemediation: async () => {
      await refreshRemediation();
    },
    setIsOpen,
    addNotification,
  });

  const bulkSelect = useBulkSelect({
    systemsRef,
    rows,
    selected,
    loaded,
    calculateChecked,
  });

  const actions = useMemo(
    () => [
      {
        title: 'Remove',
        onClick: (_event, _index, { id, display_name }) => {
          activeSystem.current = {
            id,
            display_name,
            issues: remediation.issues.filter((issue) =>
              issue.systems.find(({ id: systemId }) => systemId === id),
            ),
          };
          setIsOpen(true);
        },
      },
    ],
    [remediation.issues],
  );

  const columns = useMemo(
    () => (defaultColumns) => mergedColumns(defaultColumns, systemsColumns),
    [],
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
        getEntities={async (_i, config, _hasItems, defaultGetEntities) =>
          await fetchInventoryData(
            config,
            systemsRef.current,
            defaultGetEntities,
            connectedData,
          )
        }
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
    issues: PropTypes.arrayOf(
      PropTypes.shape({
        systems: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string,
            display_name: PropTypes.string,
            resolved: PropTypes.bool,
          }),
        ),
      }),
    ),
  }),
};

SystemsTableWrapper.propTypes = {
  ...SystemsTable.propTypes,
  registry: PropTypes.shape({
    register: PropTypes.func,
  }),
  refreshRemediation: PropTypes.func,
};

export default SystemsTable;
