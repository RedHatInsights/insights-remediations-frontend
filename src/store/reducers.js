import React from 'react';

import { ACTION_TYPES } from '../constants';
import { applyReducerHash } from '@redhat-cloud-services/frontend-components-utilities/ReducerRegistry';
import flatMap from 'lodash/flatMap';
import uniq from 'lodash/uniq';
import { RebootColumn, IssuesColumn } from '../components/SystemsTable';

function issuesToSystemsIds(issues) {
  return uniq(
    flatMap(issues, (issue) => issue.systems.map((system) => system.id))
  );
}

function computeRebootStats(remediation) {
  const systems = issuesToSystemsIds(remediation.issues);
  const rebootRequired = issuesToSystemsIds(
    remediation.issues.filter((issue) => issue.resolution.needs_reboot)
  );

  return {
    ...remediation,
    stats: {
      systemsWithReboot: rebootRequired.length,
      systemsWithoutReboot: systems.length - rebootRequired.length,
    },
  };
}

export const remediationSystems = ({ LOAD_ENTITIES_FULFILLED }) =>
  applyReducerHash({
    [ACTION_TYPES.SELECT_ENTITY]: (state, { payload }) => {
      const selected = state.selected || new Map();
      if (payload.selected) {
        if (payload.id === 0) {
          state?.rows?.forEach((row) => selected.set(row?.id, row));
        } else {
          const selectedRow = state?.rows?.find(
            ({ id } = {}) => id === payload.id
          );
          selected.set(payload.id, { ...(selectedRow || {}), id: payload.id });
        }
      } else {
        if (payload.id === 0) {
          state.rows.forEach((row) => selected.delete(row.id));
        } else if (payload.id === -1) {
          selected.clear();
        } else {
          selected.delete(payload.id);
        }
      }

      return {
        ...state,
        selected: new Map(selected),
      };
    },
    [`${LOAD_ENTITIES_FULFILLED}`]: (state) => {
      return {
        ...state,
        rows: state.rows.map(({ id, ...row }) => ({
          id,
          ...row,
          selected: !!state.selected?.get(id),
        })),
        columns: [
          ...state.columns.filter(({ key }) =>
            ['display_name', 'tags'].includes(key)
          ),
          {
            key: 'issues',
            title: 'Issues',
            // eslint-disable-next-line react/display-name
            renderFunc: (issues, id, { display_name }) => (
              <IssuesColumn
                issues={issues}
                id={id}
                displayName={display_name}
              />
            ),
            props: { width: 15 },
          },
          {
            key: 'rebootRequired',
            title: 'Reboot required',
            // eslint-disable-next-line react/display-name
            renderFunc: (rebootRequired) => (
              <RebootColumn rebootRequired={rebootRequired} />
            ),
            props: { width: 15 },
          },
        ].map((cell) => ({
          ...cell,
          props: {
            ...(cell.props || {}),
            isStatic: true,
          },
        })),
      };
    },
  });

const reducers = {
  remediations: applyReducerHash(
    {
      [ACTION_TYPES.LOAD_REMEDIATIONS_PENDING]: () => ({
        status: 'pending',
      }),
      [ACTION_TYPES.LOAD_REMEDIATIONS_FULFILLED]: (state, action) => ({
        status: 'fulfilled',
        value: action.payload.data,
      }),
      [ACTION_TYPES.LOAD_REMEDIATIONS_REJECTED]: () => ({
        status: 'rejected',
      }),
    },
    {
      status: 'initial',
    }
  ),

  selectedRemediation: applyReducerHash(
    {
      [ACTION_TYPES.LOAD_REMEDIATION_PENDING]: () => ({
        status: 'pending',
      }),
      [ACTION_TYPES.LOAD_REMEDIATION_FULFILLED]: (state, action) => ({
        status: 'fulfilled',
        remediation: computeRebootStats(action.payload),
      }),
      [ACTION_TYPES.REFRESH_REMEDIATION_FULFILLED]: (state, action) => {
        if (action.payload.id === state.remediation.id) {
          return {
            status: 'fulfilled',
            remediation: computeRebootStats(action.payload),
          };
        }

        return state;
      },
      [ACTION_TYPES.LOAD_REMEDIATION_REJECTED]: () => ({
        status: 'rejected',
      }),
      [ACTION_TYPES.PATCH_REMEDIATION_FULFILLED]: (
        { status, remediation },
        action
      ) => {
        return {
          status,
          remediation: {
            ...remediation,
            ...action.payload,
          },
        };
      },
      [ACTION_TYPES.DELETE_REMEDIATION_ISSUE_FULFILLED]: (state, action) => {
        const issues = state.remediation.issues.filter(
          (issue) => issue.id !== action.payload.issueId
        );
        if (action.payload.id === state.remediation.id) {
          return {
            status: 'fulfilled',
            remediation: computeRebootStats({
              ...state.remediation,
              issues,
              needs_reboot: issues.some(
                (issue) => issue.resolution.needs_reboot
              ), // eslint-disable-line camelcase
            }),
          };
        }

        return state;
      },
      [ACTION_TYPES.DELETE_REMEDIATION_ISSUE_SYSTEM_FULFILLED]: (
        state,
        action
      ) => {
        if (action.payload.id !== state.remediation.id) {
          return state;
        }

        const issues = state.remediation.issues.filter((issue) => {
          if (issue.id !== action.payload.issue) {
            return true;
          }

          // if the action only had 1 systems, which is now gone, remove the action also
          issue.systems = issue.systems.filter(
            (system) => system.id !== action.payload.system
          );
          return issue.systems.length > 0;
        });

        return {
          status: 'fulfilled',
          remediation: computeRebootStats({
            ...state.remediation,
            issues,
            needs_reboot: issues.some((issue) => issue.resolution.needs_reboot), // eslint-disable-line camelcase
          }),
        };
      },
    },
    {
      status: 'initial',
    }
  ),

  selectedRemediationStatus: applyReducerHash(
    {
      [ACTION_TYPES.LOAD_REMEDIATION_STATUS_PENDING]: () => ({
        status: 'pending',
      }),
      [ACTION_TYPES.LOAD_REMEDIATION_STATUS_FULFILLED]: (state, action) => ({
        status: 'fulfilled',
        data: action.payload,
      }),
      [ACTION_TYPES.LOAD_REMEDIATION_STATUS_REJECTED]: () => ({
        status: 'rejected',
      }),
    },
    {
      status: 'initial',
    }
  ),

  connectionStatus: applyReducerHash(
    {
      [ACTION_TYPES.GET_CONNECTION_STATUS_PENDING]: () => ({
        status: 'pending',
      }),
      [ACTION_TYPES.GET_CONNECTION_STATUS_FULFILLED]: (state, action) => ({
        status: 'fulfilled',
        data: action.payload.data,
        etag: action.payload.etag,
      }),
      [ACTION_TYPES.GET_CONNECTION_STATUS_REJECTED]: () => ({
        status: 'rejected',
        data: [],
      }),
      [ACTION_TYPES.SET_ETAG]: (state, action) => ({
        ...state,
        etag: action.etag,
      }),
    },
    {
      status: 'initial',
    }
  ),

  inventoryEntitiesReducer:
    (props = { INVENTORY_ACTION_TYPES: {} }) =>
    () =>
      applyReducerHash({
        [props.INVENTORY_ACTION_TYPES.LOAD_ENTITIES_FULFILLED]: (state) => {
          return {
            ...state,
            columns: [
              {
                key: 'display_name',
                title: 'Name',
                // eslint-disable-next-line
                renderFunc: (name, id, { display_name }) => <div><a href={props.urlBuilder(id)}>{display_name}</a></div>
              },
              {
                key: 'system_status',
                title: 'Status',
                // eslint-disable-next-line
                        renderFunc: (name, id) => <div>{props.generateStatus(id)}</div>
              },
            ],
          };
        },
      }),

  playbookActivityIntentory: (props) => () =>
    applyReducerHash({
      [props.INVENTORY_ACTION_TYPES.LOAD_ENTITIES_FULFILLED]: (state) => {
        return {
          ...state,
          columns: [
            {
              key: 'display_name',
              title: 'Name',
              // eslint-disable-next-line
              renderFunc: (name, id, { fqdn }) => <div><a href={props.urlBuilder(id)}>{fqdn || name || id}</a></div>
            },
            state.columns.find((col) => col.key === 'tags'),
            {
              key: 'status',
              title: 'Status',
              renderFunc: (status) => props.renderStatus(status),
            },
          ],
        };
      },

      [ACTION_TYPES.EXPAND_INVENTORY_TABLE]: (state, action) => {
        return {
          ...state,
          rows: state.rows.map((row) => ({
            ...row,
            isOpen:
              row.id === action.payload.id ? action.payload.isOpen : false,
          })),
        };
      },
    }),

  playbookRuns: applyReducerHash({
    [ACTION_TYPES.GET_PLAYBOOK_RUNS_FULFILLED]: (state, action) => ({
      status: 'fulfilled',
      data: action.payload.data,
      meta: action.payload.meta,
    }),
  }),

  cancelPlaybookRuns: applyReducerHash(
    {
      [ACTION_TYPES.CANCEL_PLAYBOOK_RUNS_PENDING]: () => ({
        status: 'pending',
      }),
      [ACTION_TYPES.CANCEL_PLAYBOOK_RUNS_FULFILLED]: (state, action) => ({
        status: 'fulfilled',
        value: action.payload,
      }),
      [ACTION_TYPES.CANCEL_PLAYBOOK_RUNS_REJECTED]: () => ({
        status: 'rejected',
      }),
    },
    {
      status: 'initial',
    }
  ),

  playbookRun: applyReducerHash({
    [ACTION_TYPES.GET_PLAYBOOK_RUN_FULFILLED]: (state, action) => ({
      data: action.payload,
    }),
  }),

  playbookRunSystems: applyReducerHash(
    {
      [ACTION_TYPES.GET_PLAYBOOK_RUN_SYSTEMS_FULFILLED]: (state, action) => ({
        ...action.payload,
      }),
      [ACTION_TYPES.GET_PLAYBOOK_RUN_SYSTEMS_PENDING]: (state) => ({
        ...state,
        status: 'pending',
      }),
      [ACTION_TYPES.GET_PLAYBOOK_RUN_SYSTEMS_REJECTED]: (state) => ({
        ...state,
        data: [],
        status: 'rejected',
      }),
    },
    {
      data: [],
      meta: {},
    }
  ),

  playbookRunSystemDetails: applyReducerHash({
    [ACTION_TYPES.GET_PLAYBOOK_RUN_SYSTEM_DETAILS_FULFILLED]: (
      state,
      action
    ) => ({
      ...action.payload,
    }),
  }),

  runRemediation: applyReducerHash(
    {
      [ACTION_TYPES.RUN_REMEDIATION_PENDING]: () => ({
        status: 'pending',
      }),
      [ACTION_TYPES.RUN_REMEDIATION_FULFILLED]: (state, action) => ({
        status: 'fulfilled',
        data: action.payload.data,
      }),
      [ACTION_TYPES.RUN_REMEDIATION_REJECTED]: (state, action) => ({
        status: action.payload.response.status === 412 ? 'changed' : 'rejected',
      }),
    },
    {
      status: 'initial',
    }
  ),

  sources: applyReducerHash(
    {
      [ACTION_TYPES.GET_ENDPOINT_FULFILLED]: (state, action) => ({
        status: 'fulfilled',
        data: {
          ...state.data,
          [action.payload.id]: action.payload,
        },
      }),
    },
    {
      status: 'initial',
    }
  ),
  executable: applyReducerHash(
    {
      [ACTION_TYPES.CHECK_EXECUTABLE_REJECTED]: () => false,
      [ACTION_TYPES.CHECK_EXECUTABLE_FULFILLED]: () => true,
    },
    false
  ),
};

export default reducers;
