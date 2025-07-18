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

// Helper function to normalize connectedData for easier mapping
export const normalizeConnectedData = (connectedData) => {
  if (
    !connectedData ||
    connectedData === 403 ||
    !Array.isArray(connectedData)
  ) {
    return new Map();
  }

  const connectionMap = new Map();
  connectedData.forEach((item) => {
    if (item.system_ids && Array.isArray(item.system_ids)) {
      item.system_ids.forEach((systemId) => {
        connectionMap.set(systemId, {
          connection_status: item.connection_status,
          executor_type: item.executor_type,
        });
      });
    }
  });

  return connectionMap;
};

export const fetchInventoryData = async (
  { page = 0, ...config } = {},
  systems,
  getEntities,
  connectedData,
) => {
  const currSystems = systems.filter(({ display_name }) =>
    config.filters?.hostnameOrId
      ? display_name.includes(config.filters.hostnameOrId)
      : true,
  );

  const data = await getEntities(
    currSystems
      .slice((page - 1) * config.per_page, page * config.per_page)
      .map(({ id }) => id),
    { ...config, hasItems: true },
    true,
  );

  const connectionMap = normalizeConnectedData(connectedData);

  const updatedResults = data.results.map((result) => {
    const systemId = result.id;
    const connectionInfo = connectionMap.get(systemId);

    if (connectionInfo) {
      return {
        ...result,
        ...connectionInfo,
      };
    } else {
      return result;
    }
  });

  return {
    ...data,
    page,
    results: updatedResults.map((host) => ({
      ...currSystems.find(({ id }) => id === host.id),
      ...host,
    })),
    total: currSystems.length,
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
