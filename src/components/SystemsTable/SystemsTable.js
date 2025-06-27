import React, {
  useEffect,
  useRef,
  useState,
  Fragment,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { InventoryTable } from '@redhat-cloud-services/frontend-components/Inventory';
import { remediationSystems } from '../../store/reducers';
import promiseMiddleware from 'redux-promise-middleware';
import ReducerRegistry from '@redhat-cloud-services/frontend-components-utilities/ReducerRegistry';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { Button } from '@patternfly/react-core';
import { deleteSystems, selectEntity, loadRemediation } from '../../actions';
import './SystemsTable.scss';
import RemoveSystemModal from './RemoveSystemModal';
import { dispatchNotification } from '../../Utilities/dispatcher';
import {
  calculateSystems,
  fetchInventoryData,
  mergedColumns,
  calculateChecked,
} from './helpers';
import systemsColumns from './Columns';

const SystemsTableWrapper = ({
  remediation,
  registry,
  refreshRemediation,
  connectedData,
  areDetailsLoading,
  refetchConnectionStatus,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const systemsRef = useRef();
  const inventory = useRef(null);
  const activeSystem = useRef(undefined);
  const dispatch = useDispatch();
  const selected = useSelector(
    ({ entities }) => entities?.selected || new Map(),
  );

  const loaded = useSelector(({ entities }) => entities?.loaded);
  const rows = useSelector(({ entities }) => entities?.rows);

  // Create a getEntities function that always reads the current systemsRef.current
  const getEntitiesFunction = useCallback(
    async (_i, config, _hasItems, defaultGetEntities) => {
      return fetchInventoryData(
        config,
        systemsRef.current,
        connectedData,
        defaultGetEntities,
      );
    },
    [connectedData],
  );

  const onConfirm = () => {
    (async () => {
      const selectedSystems =
        selected.size > 0
          ? Array.from(selected, ([, value]) => value)
          : [
              {
                ...activeSystem.current,
              },
            ];
      const action = deleteSystems(selectedSystems, remediation);
      dispatch(action);
      await action.payload;

      // Clear the bulk selection after deletion
      if (selected.size > 0) {
        selected.forEach((value, key) => {
          dispatch(selectEntity(key, false));
        });
      }

      // Refresh the remediation data first and wait for it to complete
      await refreshRemediation();

      // Refetch connection status to get updated connectedData
      if (refetchConnectionStatus) {
        await refetchConnectionStatus();
      }

      inventory?.current?.onRefreshData();
    })();
    activeSystem.current = undefined;

    // Calculate the actual number of items being deleted
    const itemsToDelete = selected.size > 0 ? selected.size : 1;

    dispatchNotification({
      title: `Removed ${itemsToDelete} ${
        itemsToDelete > 1 ? 'systems' : 'system'
      } from playbook`,
      description: '',
      variant: 'success',
      dismissable: true,
      autoDismiss: true,
    });
    setIsOpen(false);
  };

  const bulkSelectCheck = (data) => {
    return data?.filter((system) => system.selected === true);
  };
  const bulkSelectorSwitch = (selection) => {
    switch (selection) {
      case 'none':
        systemsRef.current.map((system) =>
          dispatch(selectEntity(system.id, false)),
        );
        break;
      case 'page':
        dispatch(selectEntity(0, true));
        break;
      case 'deselect page':
        rows.map(() => dispatch(selectEntity(0, false)));
        break;
      case 'all':
        systemsRef.current.map((system) =>
          dispatch(selectEntity(system.id, true)),
        );
        break;
      case 'deselect all':
        systemsRef.current.map((system) =>
          dispatch(selectEntity(system.id, false)),
        );
        break;
    }
  };
  useEffect(() => {
    systemsRef.current = calculateSystems(remediation);
  }, [remediation]);

  return (
    !areDetailsLoading && (
      <InventoryTable
        ref={inventory}
        variant="compact"
        showTags
        noDetail
        hideFilters={{
          all: true,
          name: false,
        }}
        tableProps={{
          canSelectAll: false,
        }}
        columns={(defaultColumns) =>
          mergedColumns(defaultColumns, systemsColumns)
        }
        bulkSelect={{
          isDisabled: rows ? false : true,
          count: selected ? selected.size : 0,
          items: [
            {
              title: 'Select none (0)',
              onClick: () => bulkSelectorSwitch('none'),
            },
            {
              ...(loaded && rows && rows.length > 0
                ? {
                    title: `Select page (${rows.length})`,
                    onClick: () => {
                      !selected //if nothing is selected - select the page
                        ? bulkSelectorSwitch('page')
                        : bulkSelectCheck(rows).length === rows.length //it compares the selected rows to the total selected values so you can deselect the page
                          ? bulkSelectorSwitch('deselect page')
                          : systemsRef.current.length > selected.size //it compares the total amount of rows to the selected values, so you can select additional page
                            ? bulkSelectorSwitch('page')
                            : bulkSelectorSwitch('deselect page');
                    },
                  }
                : {}),
            },
            {
              ...(loaded && rows && rows.length > 0
                ? {
                    title: `Select all (${systemsRef.current.length})`,
                    onClick: () => {
                      calculateChecked(systemsRef.current, selected)
                        ? bulkSelectorSwitch('deselect all')
                        : bulkSelectorSwitch('all');
                    },
                  }
                : {}),
            },
          ],
          checked: calculateChecked(systemsRef.current, selected),
          onSelect: () => {
            bulkSelectCheck(rows).length === rows.length
              ? bulkSelectorSwitch('deselect page')
              : bulkSelectorSwitch('page');
          },
        }}
        getEntities={getEntitiesFunction}
        onLoad={({ INVENTORY_ACTION_TYPES, mergeWithEntities }) => {
          registry?.register?.({
            ...mergeWithEntities(remediationSystems(INVENTORY_ACTION_TYPES)),
          });
        }}
        actions={[
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
        ]}
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
  const dispatch = useDispatch();
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
      <SystemsTableWrapper
        registry={registry}
        refreshRemediation={() => {
          const action = loadRemediation(props.remediation.id);
          dispatch(action);
          return action.payload;
        }}
        refetchConnectionStatus={props.refetchConnectionStatus}
        {...props}
      />
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
  refetchConnectionStatus: PropTypes.func,
};

export default SystemsTable;
