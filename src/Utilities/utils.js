export function capitalize(string) {
  return `${string.charAt(0).toUpperCase() + string.slice(1)}`;
}

/* eslint-disable camelcase */
import React, { Fragment } from 'react';
import { Bullseye, Spinner } from '@patternfly/react-core';
import * as api from '../api';
import uniqWith from 'lodash/uniqWith';
import isEqual from 'lodash/isEqual';
import { applyReducerHash } from '@redhat-cloud-services/frontend-components-utilities/ReducerRegistry/ReducerRegistry';
import { BrowserRouter as Router } from 'react-router-dom';
import { SystemsTableWithContext } from '../modules/RemediationsModal/common/SystemsTable';

export const CAN_REMEDIATE = 'remediations:remediation:write';
export const AUTO_REBOOT = 'auto-reboot';
export const HAS_MULTIPLES = 'has-multiples';
export const SELECT_PLAYBOOK = 'select-playbook';
export const SELECTED_RESOLUTIONS = 'selected-resolutions';
export const MANUAL_RESOLUTION = 'manual-resolution';
export const EXISTING_PLAYBOOK_SELECTED = 'existing-playbook-selected';
export const EXISTING_PLAYBOOK = 'existing-playbook';
export const SYSTEMS = 'systems';
export const RESOLUTIONS = 'resolutions';
export const ISSUES_MULTIPLE = 'issues-multiple';
export const TOGGLE_BULK_SELECT = 'toggle-bulk-select';

// Get the current group since we can be mounted at two urls
export const getGroup = () =>
  window.location.pathname
    .split('/')
    .filter((s) => s !== 'beta' && s.length > 0)
    .shift();

export const getEnvUrl = () => {
  const pathName = window.location.pathname.split('/');
  return pathName[1] === 'beta' ? 'beta/' : '';
};

export const remediationUrl = (id) =>
  `${document.baseURI}${getGroup()}/remediations${id ? `/${id}` : ''}`;

export const dedupeArray = (array) => [...new Set(array)];

export const pluralize = (count, str, fallback) =>
  count !== 1 ? fallback || str + 's' : str;

const sortRecords = (records, sortByState) =>
  [...records].sort((a, b) => {
    const key = Object.keys(a)[sortByState.index - 1];
    return (
      (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) *
      (sortByState.direction === 'desc' ? -1 : 1)
    );
  });

export const buildRows = (
  records,
  sortByState,
  showAlternate,
  allSystemsNamed
) =>
  sortRecords(records, sortByState).reduce(
    (acc, curr, index) => [
      ...acc,
      {
        isOpen: false,
        cells: [
          { title: curr.action },
          {
            title: (
              <Fragment key={`${index}-description`}>
                <p key={`${index}-resolution`}>{curr.resolution}</p>
                {showAlternate && curr.alternate > 0 && (
                  <p key={`${index}-alternate`}>
                    {curr.alternate} alternate{' '}
                    {pluralize(curr.alternate, 'resolution')}
                  </p>
                )}
              </Fragment>
            ),
          },
          {
            title: curr.needsReboot ? (
              <div>Required</div>
            ) : (
              <div>Not required</div>
            ),
          },
          {
            title: curr.systems?.length || 0,
            props: { isOpen: false },
          },
        ],
      },
      ...(curr.systems?.length > 0
        ? [
            {
              parent: index * 2,
              fullWidth: true,
              allSystemsNamed: allSystemsNamed.filter((system) =>
                curr.systems.includes(system.id)
              ),
              allSystems: curr.systems,
              cells: [
                {
                  title: (
                    <Bullseye>
                      <Spinner />
                    </Bullseye>
                  ),
                  props: { colSpan: 5, className: 'pf-m-no-padding' },
                },
              ],
            },
          ]
        : []),
    ],
    []
  );

const buildSystemRow = (allSystemsNamed = [], allSystems = []) => (
  <Router>
    <SystemsTableWithContext
      allSystemsNamed={allSystemsNamed}
      allSystems={allSystems}
      disabledColumns={['updated']}
    />
  </Router>
);

export const onCollapse = (event, rowKey, isOpen, rows, setRows) => {
  let temp = [...rows];
  rows[rowKey].isOpen = isOpen;
  temp[rowKey + 1].cells = [
    {
      title: buildSystemRow(
        rows[rowKey + 1].allSystemsNamed,
        rows[rowKey + 1].allSystems
      ),
    },
  ];
  setRows(temp);
};

export const getResolution = (issueId, formValues) => {
  const issueResolutions =
    formValues[RESOLUTIONS].find((r) => r.id === issueId)?.resolutions || [];

  if (
    formValues[MANUAL_RESOLUTION] &&
    issueId in formValues[SELECTED_RESOLUTIONS]
  ) {
    return issueResolutions.filter(
      (r) => r.id === formValues[SELECTED_RESOLUTIONS][issueId]
    );
  }

  if (formValues[EXISTING_PLAYBOOK_SELECTED]) {
    const existing = formValues[EXISTING_PLAYBOOK]?.issues?.find(
      (i) => i.id === issueId
    );

    if (existing) {
      return issueResolutions.filter((r) => r.id === existing.resolution.id);
    }
  }

  return issueResolutions;
};

export function createNotification(id, name, isNewSwitch) {
  const verb = isNewSwitch ? 'created' : 'updated';
  return {
    variant: 'success',
    title: `Playbook ${verb}`,
    description: (
      <span>
        You have successfully {verb} <a href={remediationUrl(id)}>{name}</a>.
      </span>
    ),
    dismissable: true,
  };
}

export const submitRemediation = (formValues, data, basePath, setState) => {
  let percent = 1;
  setState({ percent });

  const issues = data.issues
    .map(({ id }) => {
      const playbookSystems =
        formValues[EXISTING_PLAYBOOK]?.issues
          ?.find((i) => i.id === id)
          ?.systems?.map((s) => s.id) || [];
      return {
        id,
        resolution: getResolution(id, formValues)?.[0]?.id,
        systems: dedupeArray([
          ...(formValues[EXISTING_PLAYBOOK_SELECTED] ? [] : playbookSystems),
          ...(formValues[SYSTEMS][id] || []),
        ]),
      };
    })
    .filter((issue) => issue.systems.length > 0);

  const interval = setInterval(() => {
    percent < 99 && setState({ percent: ++percent });
  }, (issues.length + Object.keys(formValues[SYSTEMS]).length) / 10);

  const add = { issues, systems: [] };

  const { id } = formValues[EXISTING_PLAYBOOK] || {};
  const isUpdate = formValues[EXISTING_PLAYBOOK_SELECTED];

  (
    (isUpdate &&
      api.patchRemediation(
        id,
        { add, auto_reboot: formValues[AUTO_REBOOT] },
        basePath
      )) ||
    api.createRemediation(
      {
        name: formValues[SELECT_PLAYBOOK],
        add,
        auto_reboot: formValues[AUTO_REBOOT],
      },
      basePath
    )
  )
    .then(({ id }) => {
      setState({ id, percent: 100 });
      data?.onRemediationCreated?.({
        remediation: { id, name },
        getNotification: () =>
          createNotification(id, formValues[SELECT_PLAYBOOK], !isUpdate),
      });
    })
    .catch(() => {
      setState({ failed: true });
    })
    .finally(() => clearInterval(interval));
};

export const entitySelected = (state, { payload }) => {
  let selected = state.selected || [];
  if (payload.selected) {
    selected = [
      ...selected,
      ...(payload.id === 0 ? state.rows.map((row) => row.id) : [payload.id]),
    ];
  } else {
    if (payload.id === 0) {
      const rowsIds = state.rows.map((row) => row.id);
      selected = selected.filter((item) => !rowsIds.includes(item));
    } else {
      selected =
        payload.id === -1 ? [] : selected.filter((item) => item !== payload.id);
    }
  }

  return {
    ...state,
    selected,
  };
};

export const loadEntitiesFulfilled = (state, allSystems, sortBy) => {
  let selected = state.selected || [];
  if (!state.selected) {
    selected = allSystems ? allSystems : state.rows.map((row) => row.id);
  }
  return {
    ...state,
    selected,
    rows: sortByAttr(
      state.rows.map(({ id, ...row }) => ({
        id,
        ...row,
        selected: !!selected?.includes(id),
      })),
      'display_name',
      sortBy?.direction || 'asc'
    ),
    sortBy,
  };
};

export const changeBulkSelect = (state, action) => {
  const removeSelected = !action.payload;
  if (!removeSelected) {
    state.selected = dedupeArray([
      ...state.selected,
      ...state.rows.map((row) => row.id),
    ]);
  }

  return {
    ...state,
    selected: removeSelected ? [] : state.selected,
    rows: state.rows.map(({ id, ...row }) => ({
      id,
      ...row,
      selected: !removeSelected,
    })),
  };
};

export const sortByAttr = (systems, attribute, direction) =>
  Array.isArray(systems)
    ? systems.sort(
        (a, b) =>
          ((a[attribute] > b[attribute] && 1) || -1) *
          (direction === 'asc' ? 1 : -1)
      )
    : [];

export const fetchSystemsInfo = async (
  config,
  sortableColumns = [],
  allSystemsNamed = [],
  getEntities
) => {
  const isSortingValid = sortableColumns.includes(config.orderBy);
  config.orderBy = isSortingValid ? config.orderBy : undefined;
  config.orderDirection = isSortingValid
    ? config.orderDirection?.toLowerCase()
    : undefined;
  allSystemsNamed = sortByAttr(allSystemsNamed, 'name', config.orderDirection);
  const hostnameOrId = config?.filters?.hostnameOrId?.toLowerCase();
  const systems = hostnameOrId
    ? allSystemsNamed.reduce(
        (acc, curr) => [
          ...acc,
          ...(curr.name.toLowerCase().includes(hostnameOrId) ? [curr.id] : []),
        ],
        []
      )
    : allSystemsNamed.map((system) => system.id);
  const sliced = systems.slice(
    (config.page - 1) * config.per_page,
    config.page * config.per_page
  );
  const data =
    sliced.length > 0
      ? await getEntities(sliced, { ...config, hasItems: true, page: 1 }, true)
      : {};
  return {
    ...{
      ...data,
      results: sortByAttr(data.results, 'display_name', config.orderDirection),
    },
    total: systems.length,
    page: config.page,
    per_page: config.per_page,
    orderBy: config.orderBy,
    orderDirection: config.orderDirection,
    sortBy: { key: config.orderBy, direction: config.orderDirection },
  };
};

export const splitArray = (inputArray, perChunk) =>
  [...new Array(Math.ceil(inputArray.length / perChunk))].map((_item, key) =>
    inputArray.slice(key * perChunk, (key + 1) * perChunk)
  );

export const getPlaybookSystems = (playbook) =>
  (playbook &&
    uniqWith(
      playbook.issues?.reduce(
        (acc, curr) => [
          ...acc,
          ...curr.systems.map((system) => ({
            id: system.id,
            name: system.display_name,
          })),
        ],
        []
      ),
      isEqual
    )) ||
  [];

export const inventoryEntitiesReducer = (
  allSystems,
  { LOAD_ENTITIES_FULFILLED }
) =>
  applyReducerHash({
    SELECT_ENTITY: (state, action) => entitySelected(state, action),
    [LOAD_ENTITIES_FULFILLED]: (state, { payload }) =>
      loadEntitiesFulfilled(state, allSystems, {
        key: payload.orderBy,
        direction: payload.orderDirection,
      }),
    [TOGGLE_BULK_SELECT]: changeBulkSelect,
  });

export const shortenIssueId = (issueId) =>
  issueId?.split('|')?.slice(-1)?.[0] || issueId;

export const getIssuesMultiple = (
  issues = [],
  systems = [],
  resolutions = []
) =>
  issues
    .map((issue) => {
      const issueResolutions =
        resolutions.find((r) => r.id === issue.id)?.resolutions || [];
      const { description, needs_reboot: needsReboot } =
        issueResolutions?.[0] || {};
      return {
        action: issues.find((i) => i.id === issue.id).description,
        resolution: description,
        needsReboot,
        systems: dedupeArray([...(issue.systems || []), ...systems]),
        id: issue.id,
        alternate: issueResolutions?.length - 1,
      };
    })
    .filter((record) => record.alternate > 0);

export const matchPermissions = (permissionA, permissionB) => {
  const segmentsA = permissionA.split(':');
  const segmentsB = permissionB.split(':');

  if (segmentsA.length !== segmentsB.length) {
    return false;
  }

  return segmentsA.every(
    (segmentA, index) =>
      segmentA === segmentsB[index] ||
      segmentA === '*' ||
      segmentsB[index] === '*'
  );
};
