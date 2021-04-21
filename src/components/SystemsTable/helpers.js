export const calculateChecked = (rows = [], selected) =>
  rows.every(({ id }) => selected?.has(id))
    ? rows.length > 0
    : rows.some(({ id }) => selected?.has(id)) && null;

export const calculateSystems = (remediation) =>
  remediation.issues.reduce((acc, curr) => {
    curr.systems.forEach((host) => {
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
          ({ resolution }) => resolution.needs_reboot
        );
      } else {
        acc.push({
          ...host,
          issues: [{ ...issue, resolved: host.resolved }],
          rebootRequired: curr.resolution.needs_reboot,
        });
      }
    });
    return acc;
  }, []);

export const fetchInventoryData = async (
  { page, ...config },
  systems,
  getEntities
) => {
  const currSystems = systems
    .filter(({ display_name }) =>
      config.filters.hostnameOrId
        ? display_name.includes(config.filters.hostnameOrId)
        : true
    )
    .slice((page - 1) * config.per_page, page * config.per_page);
  const data = await getEntities(
    currSystems.map(({ id }) => id),
    { ...config, hasItems: true },
    true
  );
  return {
    ...data,
    page,
    results: data.results.map((host) => ({
      ...currSystems.find(({ id }) => id === host.id),
      ...host,
    })),
    total: systems.length,
  };
};
