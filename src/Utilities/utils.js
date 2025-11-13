export function capitalize(string) {
  return `${string.charAt(0).toUpperCase() + string.slice(1)}`;
}

import React, { Fragment } from 'react';
import { Bullseye, Spinner } from '@patternfly/react-core';
import * as api from '../api';
import uniqWith from 'lodash/uniqWith';
import isEqual from 'lodash/isEqual';
import { applyReducerHash } from '@redhat-cloud-services/frontend-components-utilities/ReducerRegistry/ReducerRegistry';
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

export const pluralize = (count, word) =>
  count === 1 ? `${count} ${word}` : `${count} ${word}s`;

// Get the current group since we can be mounted at two urls
export const getGroup = () =>
  window.location.pathname
    .split('/')
    .filter((s) => s !== 'preview' && s.length > 0)
    .shift();

export const getEnvUrl = () => {
  const pathName = window.location.pathname.split('/');
  return pathName[1] === 'preview' ? 'preview/' : '';
};

export const getBaseUri = () =>
  `${document.baseURI.replace('preview/', '')}${getEnvUrl()}`;

export const remediationUrl = (id) =>
  `${getBaseUri()}${getGroup()}/remediations${id ? `/${id}` : ''}`;

export const dedupeArray = (array) => [...new Set(array)];

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
  allSystemsNamed,
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
                curr.systems.includes(system.id),
              ),
              allSystems: curr.systems,
              cells: [
                {
                  title: (
                    <Bullseye>
                      <Spinner />
                    </Bullseye>
                  ),
                  props: { colSpan: 6, className: 'pf-m-no-padding' },
                },
              ],
            },
          ]
        : []),
    ],
    [],
  );

const buildSystemRow = (allSystemsNamed = [], allSystems = []) => (
  <SystemsTableWithContext
    allSystemsNamed={allSystemsNamed}
    allSystems={allSystems}
    disabledColumns={['updated']}
  />
);

export const onCollapse = (event, rowKey, isOpen, rows, setRows) => {
  let temp = [...rows];
  rows[rowKey].isOpen = isOpen;
  temp[rowKey + 1].cells = [
    {
      title: buildSystemRow(
        rows[rowKey + 1].allSystemsNamed,
        rows[rowKey + 1].allSystems,
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
      (r) => r.id === formValues[SELECTED_RESOLUTIONS][issueId],
    );
  }

  if (formValues[EXISTING_PLAYBOOK_SELECTED]) {
    const existing = formValues[EXISTING_PLAYBOOK]?.issues?.find(
      (i) => i.id === issueId,
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

// Helper function to create batches of issues and systems with limits to help BE handle large remediations
export const createRemediationBatches = (
  issues,
  maxIssuesPerBatch = 50,
  maxSystemsPerIssue = 50,
  maxTotalSystemsPerBatch = 50,
) => {
  if (!issues || issues.length === 0) {
    return [];
  }

  const batches = [];
  let currentBatch = [];
  let currentBatchSystemCount = 0;

  issues.forEach((issue) => {
    if (issue?.systems.length <= maxSystemsPerIssue) {
      // Issue has acceptable number of systems per issue
      const issueSystemCount = issue?.systems?.length || 0;

      // Check if adding this issue would exceed total systems limit
      if (
        currentBatchSystemCount + issueSystemCount >
        maxTotalSystemsPerBatch
      ) {
        // Start a new batch if current one would exceed total systems limit
        if (currentBatch.length > 0) {
          batches.push(currentBatch);
          currentBatch = [];
          currentBatchSystemCount = 0;
        }
      }

      // Add issue to current batch
      currentBatch.push(issue);
      currentBatchSystemCount += issueSystemCount;

      // If current batch is full by issue count, start a new one
      if (currentBatch.length >= maxIssuesPerBatch) {
        batches.push(currentBatch);
        currentBatch = [];
        currentBatchSystemCount = 0;
      }
    } else {
      // Issue has too many systems, split into multiple entries
      const systemBatches = splitArray(issue?.systems, maxSystemsPerIssue);

      systemBatches.forEach((systemBatch) => {
        const splitIssue = {
          ...issue,
          systems: systemBatch,
        };

        const splitIssueSystemCount = systemBatch.length;

        // For system-split issues, check if we need to start a new batch
        if (
          currentBatch.length > 0 &&
          currentBatchSystemCount + splitIssueSystemCount >
            maxTotalSystemsPerBatch
        ) {
          batches.push(currentBatch);
          currentBatch = [];
          currentBatchSystemCount = 0;
        }

        currentBatch.push(splitIssue);
        currentBatchSystemCount += splitIssueSystemCount;

        // Each system-split issue gets its own batch to maintain safety
        batches.push(currentBatch);
        currentBatch = [];
        currentBatchSystemCount = 0;
      });
    }
  });

  // Add any remaining issues in the current batch
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
};

export const submitRemediation = async (
  formValues,
  data,
  basePath,
  setState,
) => {
  let percent = 1;
  setState({ percent });

  const issues = data.issues
    .map(({ id, precedence }) => {
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
        precedence,
      };
    })
    .filter((issue) => issue.systems.length > 0);

  // Create batches of issues and systems (max 50 each) per BE safety measures
  const batches = createRemediationBatches(issues);
  const totalBatches = Math.max(batches.length, 1); // Ensure at least 1 to avoid division by zero

  const { id: existing_id } = formValues[EXISTING_PLAYBOOK] || {};
  const isUpdate = formValues[EXISTING_PLAYBOOK_SELECTED];

  try {
    let remediationId = existing_id;

    // If no batches (no issues with systems), still need to create/update with empty data - super edge case
    if (batches.length === 0) {
      setState({ percent: 50 }); // Mid-progress for the single operation

      const add = { issues: [], systems: [] };

      const response = await ((isUpdate &&
        api.patchRemediation(existing_id, {
          add,
          auto_reboot: formValues[AUTO_REBOOT],
        })) ||
        api.createRemediation(
          {
            name: formValues[SELECT_PLAYBOOK].trim(),
            add,
            auto_reboot: formValues[AUTO_REBOOT],
          },
          basePath,
        ));

      remediationId = response?.id ?? existing_id;
    } else {
      // Process first batch - create or update remediation
      const firstBatch = batches[0];
      const add = { issues: firstBatch, systems: [] };

      // Update progress for first batch (takes more time as it creates/updates the remediation)
      const firstBatchProgress =
        totalBatches === 1 ? 90 : Math.floor(60 / totalBatches);
      setState({ percent: Math.min(percent + firstBatchProgress, 90) });

      const response = await ((isUpdate &&
        api.patchRemediation(existing_id, {
          add,
          auto_reboot: formValues[AUTO_REBOOT],
        })) ||
        api.createRemediation(
          {
            name: formValues[SELECT_PLAYBOOK].trim(),
            add,
            auto_reboot: formValues[AUTO_REBOOT],
          },
          basePath,
        ));

      // Get the remediation ID (only returned from createRemediation)
      remediationId = response?.id ?? existing_id;

      // Update progress after first batch completion
      const progressAfterFirst =
        totalBatches === 1 ? 95 : Math.floor(70 / totalBatches);
      setState({ percent: Math.min(progressAfterFirst, 95) });

      // Process remaining batches - update remediation
      for (let i = 1; i < batches.length; i++) {
        const batch = batches[i];
        const add = { issues: batch, systems: [] };

        await api.patchRemediation(remediationId, {
          add,
          auto_reboot: formValues[AUTO_REBOOT],
        });

        // Update progress for each additional batch
        const progressPerBatch = Math.floor(25 / (totalBatches - 1));
        const currentProgress = progressAfterFirst + progressPerBatch * i;
        setState({ percent: Math.min(currentProgress, 95) });
      }
    }

    // Final success state
    setState({ id: remediationId, percent: 100 });
    data?.onRemediationCreated?.({
      remediation: { id: remediationId, name: formValues[SELECT_PLAYBOOK] },
      getNotification: () =>
        createNotification(
          remediationId,
          formValues[SELECT_PLAYBOOK],
          !isUpdate,
        ),
    });
  } catch (error) {
    console.error('Error submitting remediation:', error);
    setState({ failed: true });
  }
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
      sortBy?.direction || 'asc',
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
          (direction === 'asc' ? 1 : -1),
      )
    : [];

export const fetchSystemsInfo = async (
  config,
  sortableColumns = [],
  allSystemsNamed = [],
  getEntities,
) => {
  const isSortingValid = sortableColumns.includes(config.orderBy);
  config.orderBy = isSortingValid ? config.orderBy : undefined;
  config.orderDirection = isSortingValid
    ? config.orderDirection?.toLowerCase()
    : undefined;
  allSystemsNamed = sortByAttr(allSystemsNamed, 'name', config.orderDirection);
  const hostnameOrId = config?.filters?.hostnameOrId?.toLowerCase();
  const systems = dedupeArray(
    hostnameOrId
      ? allSystemsNamed.reduce(
          (acc, curr) => [
            ...acc,
            ...(curr.name.toLowerCase().includes(hostnameOrId)
              ? [curr.id]
              : []),
          ],
          [],
        )
      : allSystemsNamed.map((system) => system.id),
  );
  const sliced = systems.slice(
    (config.page - 1) * config.per_page,
    config.page * config.per_page,
  );
  const data =
    sliced.length > 0
      ? await getEntities(
          sliced,
          {
            ...config,
            fields: { system_profile: ['operating_system', 'bootc_status'] },
            hasItems: true,
            page: 1,
          },
          true,
        )
      : {};
  return {
    ...data,
    total: systems.length,
    results: sortByAttr(data.results, 'display_name', config.orderDirection),
    page: config.page,
    per_page: config.per_page,
    orderBy: config.orderBy,
    orderDirection: config.orderDirection,
    sortBy: { key: config.orderBy, direction: config.orderDirection },
  };
};

export const splitArray = (inputArray, perChunk) =>
  [...new Array(Math.ceil(inputArray.length / perChunk))].map((_item, key) =>
    inputArray.slice(key * perChunk, (key + 1) * perChunk),
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
        [],
      ),
      isEqual,
    )) ||
  [];

export const inventoryEntitiesReducer = (
  allSystems,
  { LOAD_ENTITIES_FULFILLED },
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
  resolutions = [],
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
      segmentsB[index] === '*',
  );
};
