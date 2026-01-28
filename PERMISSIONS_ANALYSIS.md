# Permissions Analysis

This document provides a comprehensive analysis of all permissions used in the application, their intended purposes, and usage locations.

## Permission Types

The application uses three main permission types, all fetched from the Chrome API with the format `remediations:remediation:{action}` or wildcard variants:

1. **Read** (`remediations:remediation:read` or `remediations:*:read`)
2. **Write** (`remediations:remediation:write` or `remediations:*:write`)
3. **Execute** (`remediations:remediation:execute` or `remediations:*:execute`)

## Permission Definitions

### Where Permissions Are Fetched

**File:** `src/App.js` (lines 47-77)

Permissions are fetched using `chrome.getUserPermissions('remediations')` and checked for:
- Wildcard permissions: `remediations:*:*` or `remediations:remediation:*` (grants all permissions)
- Specific permissions: `remediations:remediation:read`, `remediations:remediation:write`, `remediations:remediation:execute`
- Wildcard variants: `remediations:*:read`, `remediations:*:write`, `remediations:*:execute`

Permissions are stored in state and provided via `PermissionContext`:
```javascript
{
  permissions: {
    read: readPermission,
    write: writePermission,
    execute: executePermission
  },
  isReceptorConfigured
}
```

## Permission Usage Analysis

### 1. READ Permission (`permissions.read`)

**Status:** ⚠️ **MINIMALLY USED** - Only used for initial app access check

**Usage Locations:**

1. **`src/App.js` (line 79)**
   - **Purpose:** Determines if user can access the application at all
   - **Code:** `const hasRequiredPermissions = readPermission || writePermission;`
   - **Effect:** If user has neither read nor write permission, they see `<NotAuthorized>` component
   - **Note:** Read permission alone is sufficient to access the app, but it's never checked elsewhere

**Conclusion:** The read permission is only used as a gatekeeper for app access. Once inside the app, it's never checked again. Users with only read permission can view the app but cannot perform any write or execute operations.

---

### 2. WRITE Permission (`permissions.write`)

**Status:** ✅ **ACTIVELY USED** - Controls write operations throughout the app

**Usage Locations:**

1. **`src/App.js` (line 79)**
   - **Purpose:** Required for app access (along with read)
   - **Code:** `const hasRequiredPermissions = readPermission || writePermission;`

2. **`src/routes/OverViewPage/OverViewPage.js` (lines 96, 99)**
   - **Purpose:** Controls bulk delete functionality
   - **Code:** 
     ```javascript
     isDisabled: !context.permissions.write || !currentlySelected?.length
     className: !context.permissions.write || !currentlySelected?.length ? 'pf-v6-u-color-200' : 'pf-v6-u-danger-color-100'
     ```
   - **Effect:** Delete button is disabled and grayed out if user lacks write permission

3. **`src/components/RemediationDetailsDropdown.js` (line 82)**
   - **Purpose:** Controls visibility of dropdown menu with rename/delete options
   - **Code:** `{permission.permissions.write && (<Dropdown>...</Dropdown>)}`
   - **Effect:** Entire dropdown menu (rename/delete) is hidden if user lacks write permission

4. **`src/modules/RemediationsButton.js` (lines 36-42)**
   - **Purpose:** Controls ability to create new remediation plans
   - **Code:** Uses `CAN_REMEDIATE` constant which equals `'remediations:remediation:write'`
   - **Effect:** "Remediate with Ansible" button is disabled if user lacks write permission
   - **Note:** Uses `matchPermissions()` utility to check if user has write permission

**Summary:** Write permission controls:
- Creating new remediation plans
- Renaming remediation plans
- Deleting remediation plans (both single and bulk)

---

### 3. EXECUTE Permission (`permissions.execute`)

**Status:** ✅ **ACTIVELY USED** - Controls execution of remediation plans

**Usage Locations:**

1. **`src/routes/RemediationDetailsComponents/DetailsPageHeader.js` (line 69)**
   - **Purpose:** Controls Execute button state
   - **Code:** `isDisabled={... !permissions?.execute || ...}`
   - **Effect:** Execute button is disabled if user lacks execute permission

2. **`src/routes/RemediationDetailsComponents/DetailsGeneralContent.js` (line 28)**
   - **Purpose:** Calculates if remediation can be executed
   - **Code:** `const canExecute = permissions?.execute && ...`
   - **Effect:** Determines if execution readiness alert should be shown

3. **`src/routes/RemediationDetailsComponents/ProgressCard.js` (multiple locations)**
   - **Purpose:** Shows authorization status in execution readiness stepper
   - **Locations:**
     - Line 66: `hasExecutePermission: permissions?.execute`
     - Line 72: Used in readiness calculation
     - Line 156: Shows "Authorized" or "Not authorized" text
     - Line 315: Sets step variant (success/danger) based on permission
     - Line 318: Conditional rendering of authorization message
   - **Effect:** Progress stepper shows whether user has required execute permission

4. **`src/routes/RemediationDetailsComponents/helpers.js` (line 171)**
   - **Purpose:** Counts errors for remediation readiness calculation
   - **Code:** `if (!hasExecutePermission) count++;`
   - **Effect:** Missing execute permission counts as an error in readiness check

**Summary:** Execute permission controls:
- Ability to execute remediation plans
- Display of execution readiness status
- Error counting for remediation readiness

---

## Permission Constants

### `CAN_REMEDIATE`
**File:** `src/Utilities/utils.js` (line 13)
**Value:** `'remediations:remediation:write'`
**Usage:** Used in `RemediationsButton.js` to check if user can create remediation plans

---

## Permission Matching Utility

**File:** `src/Utilities/utils.js` (lines 589-603)
**Function:** `matchPermissions(permissionA, permissionB)`

Matches permissions with wildcard support:
- `*` matches any segment
- Used to check if user permissions match required permissions
- Example: `matchPermissions('remediations:*:write', 'remediations:remediation:write')` returns `true`

---

## Summary Table

| Permission | App Access | Create Plans | Rename Plans | Delete Plans | Execute Plans | Status |
|------------|------------|--------------|--------------|--------------|---------------|--------|
| **Read** | ✅ Required | ❌ No | ❌ No | ❌ No | ❌ No | ⚠️ Minimal use |
| **Write** | ✅ Required | ✅ Required | ✅ Required | ✅ Required | ❌ No | ✅ Fully used |
| **Execute** | ❌ Not required | ❌ No | ❌ No | ❌ No | ✅ Required | ✅ Fully used |

---

## Findings

### ✅ All Permissions Are Used
All three permissions (read, write, execute) are actively used in the application.

### ⚠️ Read Permission Has Limited Use
The **read permission** is only used for the initial app access check in `App.js`. Once a user has access (via read OR write), the read permission is never checked again. This means:
- Users with only read permission can view the entire app
- They cannot perform any write or execute operations (which is correct)
- The read permission effectively acts as a "view-only" mode gatekeeper

### 🔍 Permission Flow
1. **App Load:** User needs `read` OR `write` permission to access the app
2. **Create Plans:** Requires `write` permission (checked via `CAN_REMEDIATE`)
3. **Modify Plans:** Requires `write` permission (rename/delete operations)
4. **Execute Plans:** Requires `execute` permission (separate from write)

### 💡 Recommendations

1. **Read Permission Usage:** Consider if read permission should be checked in more places for true "view-only" mode, or if the current implementation is sufficient.

2. **Permission Documentation:** The current implementation is clear, but could benefit from inline comments explaining why read permission is only checked at app level.

3. **No Unused Permissions:** All permissions fetched from the API are used appropriately.

---

## Permission Strings Reference

The application checks for these permission strings (in order of specificity):

1. **Wildcard (all permissions):**
   - `remediations:*:*`
   - `remediations:remediation:*`

2. **Read permissions:**
   - `remediations:remediation:read`
   - `remediations:*:read`

3. **Write permissions:**
   - `remediations:remediation:write`
   - `remediations:*:write`

4. **Execute permissions:**
   - `remediations:remediation:execute`
   - `remediations:*:execute`
