import React, { useEffect, useState } from 'react';
import propTypes from 'prop-types';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import { Content, Stack, StackItem } from '@patternfly/react-core';
import ReducerRegistry from '@redhat-cloud-services/frontend-components-utilities/ReducerRegistry';
import { useDispatch, useSelector } from 'react-redux';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import isEqual from 'lodash/isEqual';
import SystemsTable from '../common/SystemsTable';
import { dedupeArray, TOGGLE_BULK_SELECT } from '../../../Utilities/utils';
import './reviewSystems.scss';

const ReviewSystems = ({ issues, systems, allSystems, registry, ...props }) => {
  let dispatch = useDispatch();
  const { input } = useFieldApi(props);
  const formOptions = useFormApi();

  const error = formOptions.getState().errors?.systems;
  const [bootcError, setBootcError] = useState(null);

  const rowsLength = useSelector(
    ({ entities }) => (entities?.rows || []).length,
  );
  const selected = useSelector(({ entities }) => entities?.selected || []);
  const bootcIds = useSelector(
    ({ entities }) =>
      entities?.rows
        ?.filter((r) => r.system_profile?.bootc_status?.booted?.image)
        .map((r) => r.id) || [],
  );
  const loaded = useSelector(({ entities }) => entities?.loaded);
  const hostsFromReducer = useSelector(
    ({ hostReducer: { hosts } }) => hosts || [],
  );
  const hostsMap = new Map(hostsFromReducer.map((host) => [host.id, host]));
  // Build allSystemsNamed, ensuring all systems from allSystems are included
  const allSystemsNamed = allSystems.map((systemId) => {
    const host = hostsMap.get(systemId);
    return {
      id: systemId,
      name: host?.display_name || systemId,
    };
  });

  useEffect(() => {
    const hasBootc = selected.some((s) => bootcIds.includes(s));
    const isAdvisor = issues?.some((i) => i?.id?.startsWith('advisor'));

    if (hasBootc && !isAdvisor) {
      setBootcError(
        'Image mode systems cannot be added to a remediation playbook.',
      );
      return input.onChange({});
    }
    setBootcError(null);
    const value = issues?.reduce((acc, curr) => {
      const tempSystems = dedupeArray([
        ...systems,
        ...(curr.systems || []),
      ]).filter((id) => selected?.includes(id));
      return {
        ...acc,
        ...(tempSystems.length > 0 ? { [curr.id]: tempSystems } : {}),
      };
    }, {});
    if (!isEqual(input.value, value)) {
      input.onChange(value);
    }
  }, [selected]);

  const onSelectRows = (value) => {
    dispatch({
      type: TOGGLE_BULK_SELECT,
      payload: value,
    });
  };

  return (
    <Stack
      hasGutter
      data-component-ouia-id="wizard-review-systems"
      data-testid="wizard-review-systems"
    >
      <StackItem>
        <Content>
          <Content component="p">
            Review and optionally exclude systems from your selection.
          </Content>
        </Content>
      </StackItem>
      <StackItem>
        <SystemsTable
          registry={registry}
          allSystemsNamed={allSystemsNamed}
          allSystems={allSystems}
          hasCheckbox={true}
          bulkSelect={{
            id: 'select-systems',
            count: selected.length,
            items: [
              {
                title: 'Select none (0)',
                onClick: () => onSelectRows(false),
              },
              ...(loaded && rowsLength > 0
                ? [
                    {
                      title: `Select page (${rowsLength})`,
                      onClick: () => onSelectRows(true),
                    },
                  ]
                : []),
            ],
            checked: selected.length > 0,
            onSelect: (value) => onSelectRows(value),
          }}
          onSelectRows
        />
      </StackItem>
      {(bootcError || error) && loaded && (
        <StackItem>
          <ExclamationCircleIcon className="ins-c-remediations-error pf-v6-u-mr-sm" />
          <span className="ins-c-remediations-error">
            {bootcError || error}
          </span>
        </StackItem>
      )}
    </Stack>
  );
};

ReviewSystems.propTypes = {
  issues: propTypes.arrayOf(
    propTypes.shape({
      description: propTypes.string,
      id: propTypes.string,
    }),
  ).isRequired,
  systems: propTypes.arrayOf(propTypes.string).isRequired,
  allSystems: propTypes.arrayOf(propTypes.string).isRequired,
  registry: propTypes.instanceOf(ReducerRegistry).isRequired,
};

export default ReviewSystems;
