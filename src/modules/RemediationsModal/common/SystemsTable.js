import React, { useEffect, useRef, useState } from 'react';
import { Provider } from 'react-redux';
import propTypes from 'prop-types';
import promiseMiddleware from 'redux-promise-middleware';
import ReducerRegistry from '@redhat-cloud-services/frontend-components-utilities/ReducerRegistry';
import InventoryTable from '@redhat-cloud-services/frontend-components/Inventory/InventoryTable';
import {
  fetchSystemsInfo,
  inventoryEntitiesReducer as entitiesReducer,
} from '../../../Utilities/utils';
import './systemsTable.scss';

const SystemsTable = ({
  registry,
  allSystemsNamed,
  allSystems,
  hasCheckbox,
  disabledColumns,
  bulkSelect,
}) => {
  const inventory = useRef(null);
  const sortableColumns = ['display_name'];

  return (
    <InventoryTable
      hideFilters={{
        tags: true,
        registeredWith: true,
        stale: true,
      }}
      columns={(columns) =>
        columns.reduce(
          (acc, curr) => [
            ...acc,
            ...(!disabledColumns.includes(curr.key)
              ? [
                  {
                    ...curr,
                    props: {
                      ...(curr.props || {}),
                      isStatic: !sortableColumns.includes(curr.key),
                    },
                  },
                ]
              : []),
          ],
          [],
        )
      }
      noDetail
      variant="compact"
      hasCheckbox={hasCheckbox}
      showTags
      bulkSelect={bulkSelect}
      ref={inventory}
      getEntities={(_i, config, showTags, defaultGetEntities) =>
        fetchSystemsInfo(
          config,
          sortableColumns,
          allSystemsNamed,
          defaultGetEntities,
        )
      }
      onLoad={({ mergeWithEntities, INVENTORY_ACTION_TYPES }) => {
        registry.register(
          mergeWithEntities(
            entitiesReducer(allSystems, INVENTORY_ACTION_TYPES),
          ),
        );
      }}
      tableProps={{
        canSelectAll: false,
      }}
    ></InventoryTable>
  );
};

SystemsTable.defaultProps = {
  disabledColumns: [],
  hasCheckbox: false,
};

SystemsTable.propTypes = {
  registry: propTypes.instanceOf(ReducerRegistry).isRequired,
  allSystemsNamed: propTypes.arrayOf(
    propTypes.shape({
      id: propTypes.string,
      name: propTypes.string,
    }),
  ).isRequired,
  allSystems: propTypes.arrayOf(propTypes.string).isRequired,
  hasCheckbox: propTypes.bool,
  disabledColumns: propTypes.arrayOf(propTypes.string),
  bulkSelect: propTypes.object,
};

export const SystemsTableWithContext = (props) => {
  const [registry, setRegistry] = useState();

  useEffect(() => {
    setRegistry(() => new ReducerRegistry({}, [promiseMiddleware]));
  }, []);

  return registry?.store ? (
    <Provider store={registry.store}>
      <div className="pf-u-pl-lg">
        <SystemsTable {...props} registry={registry} />
      </div>
    </Provider>
  ) : null;
};

export default SystemsTable;
