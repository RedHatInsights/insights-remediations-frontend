const REMEDIATIONS_APP = 'remediations';
const REMEDIATION_RESOURCE = 'remediation';

/**
 * Derive remediations read/write/execute flags from
 * `chrome.getUserPermissions('remediations')` entries.
 * Expected permission shape: `remediations:<resource>:<operation>` with optional `*` wildcards.
 *
 *  @param   {Array<{ permission?: string }|undefined>}            list Permission objects from Chrome
 *  @returns {{ read: boolean, write: boolean, execute: boolean }}      Aggregated capability flags
 */
export function getChromePerms(list) {
  const flags = { read: false, write: false, execute: false };

  if (!Array.isArray(list)) {
    return flags;
  }

  for (const item of list) {
    const raw = item?.permission;
    if (typeof raw !== 'string' || raw.length === 0) {
      continue;
    }

    const parts = raw.split(':');
    if (parts.length !== 3) {
      continue;
    }

    const [app, resource, operation] = parts;
    if (app !== REMEDIATIONS_APP) {
      continue;
    }

    const resourceMatches =
      resource === '*' || resource === REMEDIATION_RESOURCE;
    if (!resourceMatches) {
      continue;
    }

    if (operation === '*') {
      flags.read = true;
      flags.write = true;
      flags.execute = true;
    } else if (operation === 'read') {
      flags.read = true;
    } else if (operation === 'write') {
      flags.write = true;
    } else if (operation === 'execute') {
      flags.execute = true;
    }
  }

  return flags;
}
