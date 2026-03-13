import React from 'react';
import { Spinner } from '@patternfly/react-core';

export const calculateChecked = (rows = [], selected) =>
  rows.every(({ id }) => selected?.has(id))
    ? rows.length > 0
    : rows.some(({ id }) => selected?.has(id)) && null;

export const calculateSystems = (systemsData) =>
  systemsData?.map((system) => ({
    id: system.id,
    hostname: system.hostname,
    display_name: system.display_name,
    issue_count: system.issue_count,
  })) || [];

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

const buildFilter = (config) => {
  const filter = {};
  if (config?.filters?.hostnameOrId) {
    filter.display_name = config.filters.hostnameOrId;
  }
  return filter;
};

/**
 * Fetches all systems for a remediation (all pages), respecting current filters.
 * Used for "Select all" in the bulk select dropdown.
 *  @param fetchSystems
 *  @param remediationId
 *  @param config
 */
export const fetchAllRemediationSystems = async (
  fetchSystems,
  remediationId,
  config = {},
) => {
  const filter = buildFilter(config);
  const limit = 100;
  let offset = 0;
  const all = [];
  let total = 0;

  do {
    const response = await fetchSystems({
      id: remediationId,
      limit,
      offset,
      sort: 'display_name',
      ...(Object.keys(filter).length > 0 && { filter }),
    });
    const systems = calculateSystems(response?.data);
    total = response?.meta?.total ?? 0;
    all.push(...systems);
    offset += limit;
  } while (total > 0 && all.length < total);

  return all;
};

export const fetchInventoryData = async (
  { page = 1, per_page = 50, ...config } = {},
  fetchSystems,
  remediationId,
  getEntities,
  connectedData,
) => {
  // Calculate offset from page and per_page
  const offset = (page - 1) * per_page;

  const filter = buildFilter(config);

  // Fetch systems from API with pagination and filtering
  const systemsResponse = await fetchSystems({
    id: remediationId,
    limit: per_page,
    offset: offset,
    sort: 'display_name', // Default sort
    ...(Object.keys(filter).length > 0 && { filter }),
  });

  const systems = calculateSystems(systemsResponse?.data);
  const total = systemsResponse?.meta?.total || 0;

  // Don't filter client-side - let the Inventory API handle filtering
  // Just use all systems from our API response
  const currSystems = systems;

  const systemIds = currSystems.map(({ id }) => id);

  // Fetch detailed data from Inventory API
  // Note: getEntities expects the IDs array, the config, and showTags boolean
  let data;
  try {
    data = await getEntities(
      systemIds,
      { ...config, hasItems: true, per_page, page },
      true,
    );
  } catch (error) {
    console.error('Error fetching inventory data:', error);
    // If inventory fetch fails (404, systems don't exist), return basic system data
    // This allows pagination to continue even if some systems are stale
    const connectionMap = normalizeConnectedData(connectedData);

    const resultsWithConnection = currSystems.map((system) => {
      const connectionInfo = connectionMap.get(system.id);
      return connectionInfo ? { ...system, ...connectionInfo } : system;
    });

    return {
      page,
      per_page,
      results: resultsWithConnection,
      total: total,
      count: currSystems.length,
    };
  }

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
    per_page,
    results: updatedResults.map((host) => ({
      ...currSystems.find(({ id }) => id === host.id),
      ...host,
    })),
    // Use the total from the API response
    total: total,
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

export const compileTitle = (itemsTotal, loading) => {
  if (loading === true) {
    return <Spinner size="sm" />;
  }
  return `${itemsTotal} selected`;
};
