import React, {
  Fragment,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import propTypes from 'prop-types';
import { fetchHostsById } from '../../store/actions/host-actions';
import { fetchResolutions } from '../../store/actions/resolution-actions';
import { Provider, useDispatch } from 'react-redux';
import promiseMiddleware from 'redux-promise-middleware';
import ReducerRegistry from '@redhat-cloud-services/frontend-components-utilities/ReducerRegistry';
import hostReducer, {
  hostsInitialState,
} from '../../store/reducers/host-reducer';
import { applyReducerHash } from '@redhat-cloud-services/frontend-components-utilities/ReducerRegistry/ReducerRegistry';
import keyBy from 'lodash/keyBy';
import FormRenderer from '@data-driven-forms/react-form-renderer/form-renderer';
import Pf4FormTemplate from '@data-driven-forms/pf4-component-mapper/form-template';
import schemaBuilder from './schema';
import WizardMapper from '@data-driven-forms/pf4-component-mapper/wizard';

import { Wizard, Modal, ModalVariant } from '@patternfly/react-core/deprecated';
import TextField from '@data-driven-forms/pf4-component-mapper/text-field';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import SelectPlaybook from './steps/selectPlaybook';
import ReviewSystems from './steps/reviewSystems';
import ReviewActions from './steps/reviewActions';
import IssueResolution from './steps/issueResolution';
import Review from './steps/review';
import resolutionsReducer, {
  resolutionsInitialState,
} from '../../store/reducers/resolutions-reducer';
import {
  dedupeArray,
  submitRemediation,
  splitArray,
  SELECTED_RESOLUTIONS,
  EXISTING_PLAYBOOK_SELECTED,
  MANUAL_RESOLUTION,
  SYSTEMS,
  RESOLUTIONS,
  ISSUES_MULTIPLE,
} from '../../Utilities/utils';
import Progress from './steps/progress';

import { useRemediationsList } from '../../Utilities/useRemediationsList';

const initialState = {
  submitted: false,
  id: undefined,
  percent: 0,
  failed: false,
  formValues: undefined,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'schema':
      return { ...state, schema: action.payload };
    case 'state':
      return { ...state, ...action.payload };
    default:
      throw new Error();
  }
};

export const RemediationWizard = ({
  setOpen,
  data,
  basePath,
  registry,
  isCompliancePrecedenceEnabled = false,
}) => {
  const allSystems = useRef(
    dedupeArray(
      data.issues?.reduce(
        (acc, curr) => [...acc, ...(curr.systems || [])],
        [...(data.systems || [])],
      ),
    ),
  );
  const remediationsList = useRemediationsList();

  const dispatch = useDispatch();

  const [state, setState] = useReducer(reducer, initialState);

  const issuesById = keyBy(data.issues, (issue) => issue.id);

  const fetchHostNames = useCallback(
    (systems = []) => {
      const perChunk = 25;
      const uniqueSystems = dedupeArray(systems);
      const chunks = splitArray(uniqueSystems, perChunk);
      chunks.forEach((chunk) => {
        dispatch(fetchHostsById(chunk, { page: 1, perPage: perChunk }));
      });
    },
    [dispatch],
  );

  useEffect(() => {
    remediationsList &&
      setState({
        type: 'schema',
        payload: schemaBuilder(data.issues, remediationsList),
      });
    registry.register({
      hostReducer: applyReducerHash(hostReducer, hostsInitialState),
      resolutionsReducer: applyReducerHash(
        resolutionsReducer,
        resolutionsInitialState,
      ),
    });
    dispatch(fetchResolutions(data.issues));
    fetchHostNames(allSystems.current);
  }, [remediationsList, fetchHostNames, data.issues, dispatch, registry]);

  const mapperExtension = {
    'select-playbook': {
      component: SelectPlaybook,
      issues: data.issues,
      systems: data.systems,
      allSystems: allSystems.current,
      remediationsList: remediationsList,
    },
    'review-systems': {
      component: ReviewSystems,
      issues: data.issues,
      systems: data.systems || [],
      allSystems: allSystems.current,
      registry,
    },
    'review-actions': {
      component: ReviewActions,
      issues: data.issues,
    },
    'issue-resolution': {
      component: IssueResolution,
    },
    review: {
      component: Review,
      data,
      issuesById: issuesById,
    },
  };

  const validatorMapper = {
    'validate-systems': () => (value) =>
      value &&
      Object.values(value).filter((value) => typeof value !== 'undefined')
        .length
        ? undefined
        : 'At least one system must be selected. Actions must be associated to a system to be added to a playbook.',
  };

  return (
    <Fragment>
      {state.schema && !state.submitted ? (
        <FormRenderer
          schema={state.schema}
          subscription={{ values: true }}
          FormTemplate={(props) => (
            <Pf4FormTemplate {...props} showFormControls={false} />
          )}
          initialValues={{
            [RESOLUTIONS]: [],
            [ISSUES_MULTIPLE]: [],
            [SYSTEMS]: {},
            [MANUAL_RESOLUTION]: true,
            [SELECTED_RESOLUTIONS]: {},
            [EXISTING_PLAYBOOK_SELECTED]: false,
          }}
          componentMapper={{
            [componentTypes.WIZARD]: {
              component: WizardMapper,
              className: 'remediations',
              'data-ouia-component-id': 'remediation-wizard',
            },
            [componentTypes.TEXT_FIELD]: TextField,
            ...mapperExtension,
          }}
          validatorMapper={validatorMapper}
          onSubmit={(formValues) => {
            setState({
              type: 'state',
              payload: { submitted: true, formValues: formValues },
            });
            submitRemediation(
              formValues,
              data,
              basePath,
              (payload) => setState({ type: 'state', payload: payload }),
              isCompliancePrecedenceEnabled,
            );
          }}
          onCancel={() => setOpen(false)}
        />
      ) : null}
      {state.submitted ? (
        <Modal
          isOpen
          variant={ModalVariant.large}
          showClose={false}
          className="remediations"
          hasNoBodyWrapper
          aria-describedby="wiz-modal-description"
          aria-labelledby="wiz-modal-title"
        >
          <Wizard
            className="remediations"
            title={'Remediate with Ansible'}
            description={'Add actions to an Ansible Playbook'}
            steps={[
              {
                name: 'progress',
                component: (
                  <Progress
                    onClose={() => {
                      setState({
                        type: 'state',
                        payload: {
                          submitted: false,
                          id: undefined,
                          failed: false,
                          formValues: undefined,
                        },
                      });
                    }}
                    title={'Adding items to the playbook'}
                    setOpen={setOpen}
                    submitRemediation={() =>
                      submitRemediation(
                        state.formValues,
                        data,
                        basePath,
                        (payload) =>
                          setState({ type: 'state', payload: payload }),
                        isCompliancePrecedenceEnabled,
                      )
                    }
                    setState={(payload) =>
                      setState({ type: 'state', payload: payload })
                    }
                    state={state}
                  />
                ),
                isFinishedStep: true,
              },
            ]}
            onClose={() => {
              setState({
                type: 'state',
                payload: {
                  submitted: false,
                  id: undefined,
                  failed: false,
                  formValues: undefined,
                },
              });
              setOpen(false);
            }}
          />
        </Modal>
      ) : null}
    </Fragment>
  );
};

RemediationWizard.propTypes = {
  setOpen: propTypes.func.isRequired,
  data: propTypes.shape({
    issues: propTypes.arrayOf(
      propTypes.shape({
        description: propTypes.string,
        id: propTypes.string,
      }),
    ),
    systems: propTypes.arrayOf(propTypes.string),
    onRemediationCreated: propTypes.func,
  }).isRequired,
  basePath: propTypes.string,
  registry: propTypes.shape({
    register: propTypes.func,
  }).isRequired,
  remediationsList: propTypes.array,
  isCompliancePrecedenceEnabled: propTypes.bool,
};

const RemediationWizardWithContext = (props) => {
  const [registry, setRegistry] = useState();

  useEffect(() => {
    setRegistry(() => new ReducerRegistry({}, [promiseMiddleware]));
  }, []);

  return registry?.store ? (
    <Provider store={registry.store}>
      <RemediationWizard {...props} registry={registry} />
    </Provider>
  ) : null;
};

export default RemediationWizardWithContext;
