export const calculateChecked = (rows = [], selected) =>
  rows.every(({ id }) => selected?.has(id))
    ? rows.length > 0
    : rows.some(({ id }) => selected?.has(id)) && null;

export const calculateSystems = (remediation) =>
  remediation?.issues?.reduce((acc, curr) => {
    curr?.systems?.forEach((host) => {
      const found = acc.find(({ id }) => host.id === id);
      const issue = {
        id: curr.id,
        resolution: curr.resolution,
        description: curr.description,
      };
      if (found) {
        found.issues = [
          ...found.issues,
          { ...issue, resolved: found.resolved },
        ];
        found.rebootRequired = found.issues.some(
          ({ resolution }) => resolution?.needs_reboot,
        );
      } else {
        acc.push({
          ...host,
          issues: [{ ...issue, resolved: host.resolved }],
          rebootRequired: curr?.resolution?.needs_reboot,
        });
      }
    });
    return acc;
  }, []) || [];

The new pipeline does three separate passes over your data (`updatedResults`, `filteredResults`, `connectedResults`) and also reorders `getEntities`/`connectedData` in the signature, which is both verbose and a breaking change. You can collapse all three steps into one reduce and restore a more intuitive parameter order. For example:

```js
export const fetchInventoryData = async (
  { page = 0, ...config } = {},
  systems,
  getEntities,
  connectedData
) => {
  // 1) filter systems by hostname/id
  const filteredSystems = systems.filter(({ display_name }) =>
    config.filters?.hostnameOrId
      ? display_name.includes(config.filters.hostnameOrId)
      : true
  );

  // 2) fetch entities (safely defaulting to empty results)
  const data = (await getEntities(
    filteredSystems
      .slice((page - 1) * config.per_page, page * config.per_page)
      .map(({ id }) => id),
    { ...config, hasItems: true },
    true
  )) || { results: [] };

  // 3) single-pass merge, filter out unconnected & unmapped
  const results = data.results.reduce((acc, result) => {
    const system = filteredSystems.find(s => s.id === result.id);
    if (!system) {
      return acc;
    }
    // skip if not connected
    if (
      connectedData === 403 ||
      !connectedData.some(cd => cd.system_ids.includes(result.id))
    ) {
      return acc;
    }
    // merge connection info
    const { connection_status, executor_type } =
      connectedData.find(cd => cd.system_ids.includes(result.id)) || {};
    acc.push({
      ...system,
      ...result,
      connection_status,
      executor_type
    });
    return acc;
  }, []);

  return {
    ...data,
    page,
    results,
    total: results.length
  };
};
  { page = 0, ...config } = {},
  systems,
  connectedData,
  getEntities,
) => {
  const currSystems = systems.filter(({ display_name }) =>
    config.filters?.hostnameOrId
      ? display_name.includes(config.filters.hostnameOrId)
      : true,
  );

  const data = (await getEntities(
    currSystems
      .slice((page - 1) * config.per_page, page * config.per_page)
      .map(({ id }) => id),
    { ...config, hasItems: true },
    true,
  )) || { results: [] };

  const updatedResults = (data.results || []).map((result) => {
    const systemId = result.id;
    const matchedItem =
      connectedData !== 403 &&
      connectedData.find((item) => item.system_ids.includes(systemId));
    if (matchedItem) {
      return {
        ...result,
        connection_status: matchedItem.connection_status,
        executor_type: matchedItem.executor_type,
      };
    } else {
      return result;
    }
  });

  const filteredResults = updatedResults.filter((result) =>
    systems.some((system) => system.id === result.id),
  );

  const connectedSystemIds =
    (connectedData !== 403 &&
      connectedData?.flatMap((group) => group.system_ids || [])) ||
    [];

  const connectedResults = filteredResults.filter((result) =>
    connectedSystemIds.includes(result.id),
  );

  return {
    ...data,
    page,
    results:
      connectedResults?.map((host) => ({
        ...systems.find(({ id }) => id === host.id),
        ...host,
      })) || [],
    total: connectedResults?.length || 0,
  };
};

export const mergedColumns = (defaultColumns = [], customColumns = []) => {
  return customColumns.map((column) => {
    const inventoryColumn = defaultColumns.find(
      (invColumn) => invColumn.key === column.key,
    );

    return inventoryColumn ? { ...inventoryColumn, ...column } : column;
  });
};
