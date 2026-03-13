import React, { useState, useEffect } from 'react';
import propTypes from 'prop-types';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import {
  Skeleton,
  SkeletonSize,
} from '@redhat-cloud-services/frontend-components/Skeleton';
import * as api from '../../../api';
import { Fragment } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import FetchError from './fetchError';
import ExistingPlaybookTypeahead from '../common/ExistingPlaybookTypeahead';
import {
  FormGroup,
  Grid,
  GridItem,
  Radio,
  Content,
  TextInput,
  Stack,
  StackItem,
  Popover,
  Button,
  Alert,
  ValidatedOptions,
} from '@patternfly/react-core';
import differenceWith from 'lodash/differenceWith';
import isEqual from 'lodash/isEqual';
import {
  getIssuesMultiple,
  pluralize,
  EXISTING_PLAYBOOK,
  EXISTING_PLAYBOOK_SELECTED,
  RESOLUTIONS,
  ISSUES_MULTIPLE,
} from '../../../Utilities/utils';
import './selectPlaybook.scss';

const SelectPlaybook = (props) => {
  const { issues, systems, allSystems, remediationsList } = props;
  const { input } = useFieldApi(props);
  const formOptions = useFormApi();
  const values = formOptions.getState().values;
  const [isDisabled, setIsDisabled] = useState(false);

  const [existingRemediations, setExistingRemediations] = useState();
  const [existingPlaybookSelected, setExistingPlaybookSelected] = useState(
    values[EXISTING_PLAYBOOK_SELECTED],
  );
  const [newPlaybookName, setNewPlaybookName] = useState(
    values[EXISTING_PLAYBOOK_SELECTED] ? '' : input.value,
  );
  const [selectedPlaybook, setSelectedPlaybook] = useState(
    values[EXISTING_PLAYBOOK],
  );
  const [isLoadingRemediation, setIsLoadingRemediation] = useState(false);

  const errors = useSelector(
    ({ resolutionsReducer }) => resolutionsReducer?.errors || [],
    shallowEqual,
  );
  const warnings = useSelector(
    ({ resolutionsReducer }) => resolutionsReducer?.warnings || [],
    shallowEqual,
  );
  const resolutions = useSelector(
    ({ resolutionsReducer }) => resolutionsReducer?.resolutions || [],
    shallowEqual,
  );
  const isLoading = useSelector(
    ({ resolutionsReducer }) => resolutionsReducer?.isLoading,
  );

  useEffect(() => {
    async function fetchData() {
      const { data: existingRemediations } = await api.getRemediations();
      setExistingRemediations(existingRemediations);
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (differenceWith(resolutions, values[RESOLUTIONS], isEqual)?.length > 0) {
      formOptions.change(RESOLUTIONS, resolutions);
      formOptions.change(
        ISSUES_MULTIPLE,
        getIssuesMultiple(issues, systems, resolutions),
      );
    }
  });

  //cannot use hook here, as it needs to be called in the OnChange function
  const verifyName = (val) => {
    setNewPlaybookName(val);
    existingPlaybookSelected || input.onChange(val);
    const trimmedVal = val.trim();
    const compareData = () => {
      const dataHashmap = {};
      remediationsList &&
        remediationsList.forEach((item) => {
          dataHashmap[item.name] = true;
        });

      if (dataHashmap[trimmedVal]) {
        setIsDisabled(true);
      } else {
        setIsDisabled(false);
      }
    };
    return compareData();
  };

  return errors.length <= 0 ? (
    <Stack hasGutter data-component-ouia-id="wizard-select-playbook">
      <StackItem>
        {warnings.length !== 0 && (
          <StackItem>
            <Alert
              variant="warning"
              isInline
              title={
                <Content component="p">
                  There {pluralize(warnings.length, 'was', 'were')}{' '}
                  <Popover
                    aria-label="Resolution error popover"
                    bodyContent={
                      <Fragment>
                        {warnings.map((warning, key) => (
                          <div key={key}>{warning}</div>
                        ))}
                      </Fragment>
                    }
                  >
                    <b>
                      <Button variant="link" isInline>
                        {warnings.length}
                      </Button>{' '}
                      {pluralize(warnings.length, 'error')}
                    </b>
                  </Popover>{' '}
                  while fetching resolutions for your issues!{' '}
                </Content>
              }
            />
          </StackItem>
        )}
        <Content>
          <Content component="p">
            You selected <b>{pluralize(allSystems.length, 'system')} </b>
            to remediate with Ansible, which in total includes{' '}
            <b>{pluralize(issues?.length, 'issue')} </b>
            {issues?.length !== resolutions.length && !isLoading ? (
              <Fragment>
                of which <b>{resolutions.length} </b>
              </Fragment>
            ) : (
              'which'
            )}{' '}
            can be remediated by Ansible.
          </Content>
        </Content>
      </StackItem>
      <StackItem>
        <Grid hasGutter>
          <GridItem sm={12} md={6} lg={4}>
            <Radio
              label={
                existingRemediations
                  ? `Add to existing playbook (${existingRemediations.length})`
                  : 'Add to existing playbook'
              }
              aria-label="Add to existing playbook"
              id="existing"
              name="radio"
              isDisabled={!existingRemediations || !existingRemediations.length}
              defaultChecked={existingPlaybookSelected}
              onChange={() => {
                setExistingPlaybookSelected(true);
                formOptions.change(EXISTING_PLAYBOOK_SELECTED, true);
                input.onChange(selectedPlaybook?.name || '');
                formOptions.change(EXISTING_PLAYBOOK, selectedPlaybook);
              }}
            />
          </GridItem>
          <GridItem sm={12} md={6} lg={4}>
            {existingRemediations && !isLoadingRemediation ? (
              <ExistingPlaybookTypeahead
                selectedPlaybook={selectedPlaybook}
                setIsLoadingRemediation={setIsLoadingRemediation}
                setSelectedPlaybook={setSelectedPlaybook}
                existingPlaybookSelected={existingPlaybookSelected}
                existingRemediations={existingRemediations}
                input={input}
                formOptions={formOptions}
              />
            ) : (
              <Skeleton size={SkeletonSize.lg} data-testid="skeleton-loader" />
            )}
          </GridItem>
        </Grid>
      </StackItem>
      <StackItem>
        <Grid hasGutter>
          <GridItem sm={12} md={6} lg={4}>
            <Radio
              label="Create new plan"
              aria-label="Create new plan"
              id="new"
              name="radio"
              defaultChecked={!existingPlaybookSelected}
              onChange={() => {
                setExistingPlaybookSelected(false);
                formOptions.change(EXISTING_PLAYBOOK_SELECTED, false);
                input.onChange(newPlaybookName);
                formOptions.change(EXISTING_PLAYBOOK, undefined);
              }}
            />
          </GridItem>
          <GridItem sm={12} md={6} lg={4}>
            <FormGroup fieldId="remediation-name">
              <TextInput
                type="text"
                value={newPlaybookName}
                onChange={(_event, val) => {
                  verifyName(val);
                }}
                aria-label="Name your playbook"
                autoFocus
                validated={
                  isDisabled &&
                  !existingPlaybookSelected &&
                  ValidatedOptions.error
                }
              />

              {isDisabled && !existingPlaybookSelected && (
                <p className="pf-v6-u-font-size-sm pf-v6-u-danger-color-100">
                  A remediation plan with the same name already exists in your
                  organization. Enter a unique name and try again.
                </p>
              )}
            </FormGroup>
          </GridItem>
        </Grid>
      </StackItem>
    </Stack>
  ) : (
    <FetchError />
  );
};

SelectPlaybook.propTypes = {
  issues: propTypes.arrayOf(
    propTypes.shape({
      description: propTypes.string,
      id: propTypes.string,
    }),
  ).isRequired,
  systems: propTypes.arrayOf(propTypes.string).isRequired,
  allSystems: propTypes.arrayOf(propTypes.string).isRequired,
  remediationsList: propTypes.array,
};

export default SelectPlaybook;
