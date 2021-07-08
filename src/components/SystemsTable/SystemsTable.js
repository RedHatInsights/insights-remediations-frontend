import React, { useEffect, useRef, useState, Fragment } from 'react';
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
import { generateUniqueId } from '../Alerts/PlaybookToastAlerts';
import {
  calculateChecked,
  calculateSystems,
  fetchInventoryData,
} from './helpers';

const SystemsTableWrapper = ({
  remediation,
  registry,
  refreshRemediation,
  setActiveAlert,
}) => {
  const [isOpen, setIsOpen] = useState();
  const systemsRef = useRef();
  const getEntitiesRef = useRef(() => undefined);
  const activeSystem = useRef(undefined);
  const dispatch = useDispatch();
  const selected = useSelector(
    ({ entities }) => entities?.selected || new Map()
  );
  const loaded = useSelector(({ entities }) => entities?.loaded);
  const rows = useSelector(({ entities }) => entities?.rows);

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
      refreshRemediation();
    })();
    activeSystem.current = undefined;
    setActiveAlert({
      key: generateUniqueId(),
      title: `Removed ${selected.size} ${
        selected.size > 1 ? 'systems' : 'system'
      } from playbook`,
      description: '',
      variant: 'success',
    });
    setIsOpen(false);
  };

  useEffect(() => {
    systemsRef.current = calculateSystems(remediation);
  }, [remediation.id]);

  return (
    <InventoryTable
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
      bulkSelect={{
        count: selected ? selected.size : 0,
        items: [
          {
            title: 'Select none (0)',
            onClick: () => {
              dispatch(selectEntity(-1, false));
            },
          },
          {
            ...(loaded && rows && rows.length > 0
              ? {
                  title: `Select page (${rows.length})`,
                  onClick: () => {
                    dispatch(selectEntity(0, true));
                  },
                }
              : {}),
          },
        ],
        checked: calculateChecked(rows, selected),
        onSelect: (value) => {
          dispatch(selectEntity(0, value));
        },
      }}
      getEntities={async (_i, config) =>
        fetchInventoryData(config, systemsRef.current, getEntitiesRef.current)
      }
      onLoad={({ INVENTORY_ACTION_TYPES, mergeWithEntities, api }) => {
        getEntitiesRef.current = api?.getEntities;
        registry?.register?.({
          ...mergeWithEntities(remediationSystems(INVENTORY_ACTION_TYPES)),
        });
      }}
      actions={[
        {
          title: 'Remove system',
          onClick: (_event, _index, { id, display_name: displayName }) => {
            activeSystem.current = {
              id,
              displayName,
              issues: remediation.issues.filter((issue) =>
                issue.systems.find(({ id: systemId }) => systemId === id)
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
          Remove system
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
        [promiseMiddleware]
      )
    );
  }, []);

  return registry ? (
    <Provider store={registry.store}>
      <SystemsTableWrapper
        registry={registry}
        refreshRemediation={() =>
          dispatch(loadRemediation(props.remediation.id))
        }
        setActiveAlert={props.setActiveAlert}
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
          })
        ),
      })
    ),
  }),
};

SystemsTableWrapper.propTypes = {
  ...SystemsTable.propTypes,
  registry: PropTypes.shape({
    register: PropTypes.func,
  }),
  refreshRemediation: PropTypes.func,
  setActiveAlert: PropTypes.func,
};

export default SystemsTable;
