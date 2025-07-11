import React, { useState, useEffect } from 'react';
import propTypes from 'prop-types';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import { TableVariant, sortable, expandable } from '@patternfly/react-table';
import {
  Table,
  TableHeader,
  TableBody,
} from '@patternfly/react-table/deprecated';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import {
  Text,
  TextContent,
  Stack,
  StackItem,
  Switch,
} from '@patternfly/react-core';
import {
  buildRows,
  getResolution,
  onCollapse,
  EXISTING_PLAYBOOK,
  EXISTING_PLAYBOOK_SELECTED,
  SELECT_PLAYBOOK,
  SYSTEMS,
} from '../../../Utilities/utils';
import { useSelector } from 'react-redux';
import './review.scss';

const Review = (props) => {
  const formOptions = useFormApi();
  const selectedPlaybook = formOptions.getState().values[EXISTING_PLAYBOOK];
  const existingPlaybookSelected =
    formOptions.getState().values[EXISTING_PLAYBOOK_SELECTED];
  const systems = formOptions.getState().values[SYSTEMS];

  const { data, issuesById } = {
    ...props,
    data: {
      ...props.data,
      issues: props.data.issues.filter(
        (issue) => systems[issue.id]?.length > 0,
      ),
    },
  };
  const { input } = useFieldApi(props);
  const [sortByState, setSortByState] = useState({
    index: undefined,
    direction: undefined,
  });

  const allSystemsNamed = useSelector(
    ({ hostReducer: { hosts } }) =>
      hosts?.map((host) => ({ id: host.id, name: host.display_name })) || [],
  );

  const records = data.issues.map((issue) => {
    const issueResolutions = getResolution(
      issue.id,
      formOptions.getState().values,
    );
    const { description, needs_reboot: needsReboot } =
      issueResolutions?.[0] || {};
    return {
      action: issuesById[issue.id].description,
      resolution: description,
      needsReboot,
      systems: systems[issue.id],
    };
  });

  useEffect(() => {
    input.onChange(
      input.value !== ''
        ? input.value
        : (existingPlaybookSelected && selectedPlaybook.auto_reboot) ||
            records.some((record) => record.needsReboot),
    );
  }, []);

  const [rows, setRows] = useState(
    buildRows(records, sortByState, false, allSystemsNamed),
  );

  useEffect(() => {
    setRows(buildRows(records, sortByState, false, allSystemsNamed));
  }, [sortByState]);

  return (
    <Stack
      hasGutter
      data-component-ouia-id="wizard-review"
      data-testid="wizard-review"
    >
      <StackItem>
        <TextContent>
          <Text>
            Issues listed below will be added to the playbook{' '}
            <b>{formOptions.getState().values[SELECT_PLAYBOOK]}</b>.
          </Text>
        </TextContent>
      </StackItem>
      {records.some((r) => r.needsReboot) && (
        <StackItem>
          <TextContent>
            <Text className="ins-c-playbook-reboot-required">
              <ExclamationTriangleIcon /> A system reboot is required to
              remediate selected issues
            </Text>
          </TextContent>
        </StackItem>
      )}
      <StackItem>
        <TextContent>
          <Text>
            The playbook <b>{formOptions.getState().values[SELECT_PLAYBOOK]}</b>
            {input.value ? (
              ' auto reboots systems.'
            ) : (
              <span className="ins-c-remediation-danger-text">
                {' '}
                does not auto reboot systems.
              </span>
            )}
          </Text>
        </TextContent>
      </StackItem>
      <StackItem>
        <Switch
          data-testid="autoreboot-switch"
          label="Auto reboot is on"
          labelOff="Auto reboot is off"
          isChecked={input.value}
          onChange={() => input.onChange(!input.value)}
          ouiaId="autoreboot-switch"
        />
      </StackItem>
      <Table
        aria-label="Actions"
        className="ins-c-remediation-summary-table"
        variant={TableVariant.compact}
        cells={[
          {
            title: 'Action',
            transforms: [sortable],
          },
          {
            title: 'Resolution',
            transforms: [sortable],
          },
          {
            title: 'Reboot required',
            transforms: [sortable],
          },
          {
            title: 'Systems',
            transforms: [sortable],
            cellFormatters: [expandable],
          },
        ]}
        rows={rows}
        onSort={(event, index, direction) =>
          setSortByState({ index, direction })
        }
        onCollapse={(event, rowKey, isOpen) =>
          onCollapse(event, rowKey, isOpen, rows, setRows)
        }
        sortBy={sortByState}
      >
        <TableHeader noWrap />
        <TableBody />
      </Table>
    </Stack>
  );
};

Review.propTypes = {
  data: propTypes.shape({
    issues: propTypes.array,
    systems: propTypes.array,
    onRemediationCreated: propTypes.func,
  }).isRequired,
  issuesById: propTypes.shape({
    [propTypes.string]: propTypes.shape({
      id: propTypes.string,
      description: propTypes.string,
    }),
  }).isRequired,
};

export default Review;
