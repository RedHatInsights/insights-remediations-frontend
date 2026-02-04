/**
 * Permission mapping for remediations
 * Maps RBAC permission strings to Kessel relations
 */
export const PERMISSION_MAP = {
  'remediations:remediation:read': 'view',
  'remediations:remediation:write': 'edit',
  'remediations:remediation:execute': 'execute',
  'remediations:*:read': 'view',
  'remediations:*:write': 'edit',
  'remediations:*:execute': 'execute',
  'remediations:*:*': 'all',
  'remediations:remediation:*': 'all',
};

/**
 * Get Kessel relation from RBAC permission string
 *  @param   {string}      permission - RBAC permission string (e.g., 'remediations:remediation:read')
 *  @returns {string|null}            - Kessel relation (e.g., 'view') or null if not found
 */
export const getKesselRelation = (permission) => {
  // Check exact match first
  if (PERMISSION_MAP[permission]) {
    return PERMISSION_MAP[permission];
  }

  // Check wildcard patterns
  if (permission.includes('*:*')) {
    return 'all';
  }

  // Extract action from permission string (format: service:resource:action)
  const parts = permission.split(':');
  if (parts.length >= 3) {
    const action = parts[parts.length - 1];
    // Map common actions
    switch (action) {
      case 'read':
        return 'view';
      case 'write':
        return 'edit';
      case 'execute':
        return 'execute';
      default:
        return null;
    }
  }

  return null;
};
