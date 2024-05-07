import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import {
  SELECT_PLAYBOOK,
  MANUAL_RESOLUTION,
  EXISTING_PLAYBOOK,
  EXISTING_PLAYBOOK_SELECTED,
  SELECTED_RESOLUTIONS,
  AUTO_REBOOT,
  SYSTEMS,
  ISSUES_MULTIPLE,
  RESOLUTIONS,
  shortenIssueId,
} from '../../Utilities/utils';
import { verifyName } from './common/helpers';

export const selectPlaybookFields = (remediationsList) => [
  {
    name: SELECT_PLAYBOOK,
    component: 'select-playbook',
    validate: [
      {
        type: validatorTypes.PATTERN,
        pattern: /^$|^.*[\w\d]+.*$/,
      },
      {
        type: validatorTypes.REQUIRED,
      },
      (value, formValues) => {
        const isPlaybookSelected = formValues[EXISTING_PLAYBOOK_SELECTED];
        if (!isPlaybookSelected && value) {
          return verifyName(value, remediationsList)
            ? 'Duplicate names are not allowed'
            : undefined;
        }
        return undefined;
      },
    ],
  },
  {
    name: EXISTING_PLAYBOOK_SELECTED,
    component: componentTypes.TEXT_FIELD,
    hideField: true,
  },
  {
    name: EXISTING_PLAYBOOK,
    component: componentTypes.TEXT_FIELD,
    hideField: true,
  },
  {
    name: RESOLUTIONS,
    component: componentTypes.TEXT_FIELD,
    hideField: true,
  },
];

export const reviewActionsFields = [
  {
    name: MANUAL_RESOLUTION,
    component: 'review-actions',
  },
];

export const reviewActionsNextStep = (values) => {
  const filteredIssues = values[EXISTING_PLAYBOOK_SELECTED]
    ? values[ISSUES_MULTIPLE].filter(
        (issue) =>
          !values[EXISTING_PLAYBOOK].issues.some((i) => i.id === issue.id) &&
          Object.keys(values[SYSTEMS]).includes(issue.id)
      )
    : values[ISSUES_MULTIPLE].filter((issue) =>
        Object.keys(values[SYSTEMS]).includes(issue.id)
      );
  return values[MANUAL_RESOLUTION] ? filteredIssues[0]?.id : 'review';
};

export const issueResolutionNextStep = (values, issue) => {
  const filteredIssues = values[EXISTING_PLAYBOOK_SELECTED]
    ? values[ISSUES_MULTIPLE].filter(
        (issue) =>
          !values[EXISTING_PLAYBOOK].issues.some(
            (i) =>
              i.id === issue.id &&
              Object.keys(values[SYSTEMS]).includes(issue.id)
          )
      )
    : values[ISSUES_MULTIPLE].filter((issue) =>
        Object.keys(values[SYSTEMS]).includes(issue.id)
      );
  return (
    filteredIssues.slice(
      filteredIssues.findIndex((i) => i.id === issue.id) + 1,
      filteredIssues.length
    )[0]?.id || 'review'
  );
};

export const reviewSystemsNextStep = (values) => {
  const filteredIssues = values[EXISTING_PLAYBOOK_SELECTED]
    ? values[ISSUES_MULTIPLE].filter(
        (issue) =>
          !values[EXISTING_PLAYBOOK].issues.some(
            (i) =>
              i.id === issue.id &&
              Object.keys(values[SYSTEMS]).includes(issue.id)
          )
      )
    : values[ISSUES_MULTIPLE].filter((issue) =>
        Object.keys(values[SYSTEMS]).includes(issue.id)
      );
  return filteredIssues.length > 0 ? 'actions' : 'review';
};

export default (issues, remediationsList) => ({
  fields: [
    {
      component: componentTypes.WIZARD,
      name: 'remediations-wizard',
      isDynamic: true,
      inModal: true,
      showTitles: true,
      title: 'Remediate with Ansible',
      description: 'Add actions to an Ansible Playbook',
      fields: [
        {
          name: 'playbook',
          title: 'Select playbook',
          fields: selectPlaybookFields(remediationsList),
          nextStep: 'systems',
        },
        {
          name: 'systems',
          title: 'Review systems',
          fields: [
            {
              name: SYSTEMS,
              component: 'review-systems',
              validate: [{ type: 'validate-systems' }],
            },
          ],
          nextStep: ({ values }) => reviewSystemsNextStep(values),
        },
        {
          name: 'actions',
          title: 'Review and edit actions',
          fields: reviewActionsFields,
          nextStep: ({ values }) => reviewActionsNextStep(values, issues),
        },
        ...(issues?.map((issue) => ({
          name: issue.id,
          title: shortenIssueId(issue.id),
          showTitle: false,
          fields: [
            {
              name: issue.id,
              component: 'issue-resolution',
              issue,
            },
            {
              name: SELECTED_RESOLUTIONS,
              component: componentTypes.TEXT_FIELD,
              hideField: true,
            },
          ],
          nextStep: ({ values }) => issueResolutionNextStep(values, issue),
          substepOf: 'Choose actions',
        })) || []),
        {
          name: 'review',
          title: 'Remediation review',
          fields: [
            {
              name: AUTO_REBOOT,
              component: 'review',
            },
          ],
        },
      ],
    },
  ],
});
