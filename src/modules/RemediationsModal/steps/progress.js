import React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateVariant,
  EmptyStateBody,
  EmptyStateActions,
  EmptyStateFooter,
} from '@patternfly/react-core';
import ProgressBar from '../common/ProgressBar';
import PropTypes from 'prop-types';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExternalLinkAltIcon,
  InProgressIcon,
} from '@patternfly/react-icons';
import {
  dedupeArray,
  getEnvUrl,
  pluralize,
  remediationUrl,
  SELECT_PLAYBOOK,
  SYSTEMS,
} from '../../../Utilities/utils';
import { useFeatureFlag } from '../../../Utilities/Hooks/useFeatureFlag';
import './progress.scss';

const Progress = ({ onClose, setOpen, submitRemediation, setState, state }) => {
  const isLightspeedRebrandEnabled = useFeatureFlag(
    'platform.lightspeed-rebrand',
  );
  const { percent, failed, systems, issues, playbook } = {
    percent: state.percent,
    failed: state.failed,
    systems: dedupeArray(Object.values(state.formValues[SYSTEMS]).flat()),
    issues: Object.keys(state.formValues[SYSTEMS]),
    playbook: {
      name: state.formValues[SELECT_PLAYBOOK],
      id: state.id,
    },
  };

  return (
    <EmptyState
      headingLevel="h1"
      icon={
        failed
          ? ExclamationCircleIcon
          : percent === 100
            ? CheckCircleIcon
            : InProgressIcon
      }
      titleText={
        <>
          {failed
            ? 'Error: Unable to add items to playbook'
            : percent === 100
              ? 'Items added to playbook'
              : 'Adding items to the playbook'}
        </>
      }
      variant={EmptyStateVariant.lg}
      data-testid="wizard-progress"
      data-component-ouia-id="wizard-progress"
    >
      <EmptyStateBody className="pf-c-progress-bar pf-v6-u-mt-md">
        <ProgressBar percent={percent} failed={failed} />
      </EmptyStateBody>
      <EmptyStateFooter>
        {(failed || percent === 100) && (
          <EmptyStateBody className="pf-c-progress-message">
            {failed ? (
              'Please try again.'
            ) : (
              <div>
                {`${pluralize(issues.length, 'action')} affecting 
                        ${pluralize(systems.length, 'system')} 
                        ${
                          issues.length > 1 ? 'were' : 'was'
                        } added to the playbook `}
                <a href={remediationUrl(playbook.id)}>{playbook.name}</a>.
              </div>
            )}
          </EmptyStateBody>
        )}
        {percent === 100 && (
          <EmptyStateBody className="pf-c-progress-message-description pf-v6-u-mb-md">
            You can remediate these systems directly from{' '}
            {isLightspeedRebrandEnabled ? 'Red Hat Lightspeed' : 'Insights'} by
            enabling
            <Button
              className="pf-v6-u-py-0 pf-v6-u-px-xs"
              variant="link"
              ouiaId="CloudConnectorButton"
              icon={<ExternalLinkAltIcon />}
              iconPosition="right"
              size="sm"
              onClick={() =>
                (window.location.href = `${
                  window.location.origin
                }/${getEnvUrl()}settings/connector`)
              }
            >
              Cloud Connector
            </Button>
            on eligible systems.
          </EmptyStateBody>
        )}
        {failed && (
          <Button
            className="pf-v6-u-mt-md pf-v6-u-mb-sm"
            variant="primary"
            ouiaId="TryAgainButton"
            data-testid={'TryAgainButton'}
            onClick={() => {
              setState({ failed: false, percent: 0 });
              submitRemediation(false);
            }}
          >
            Try again
          </Button>
        )}
        {percent === 100 && (
          <Button
            className="pf-v6-u-mt-md pf-v6-u-mb-sm"
            variant="primary"
            ouiaId="ReturnToAppButton"
            onClick={() => {
              onClose();
              setOpen(false);
            }}
          >
            Return to application
          </Button>
        )}
        <EmptyStateActions>
          {failed && (
            <Button
              variant="secondary"
              ouiaId="BackToWizardButton"
              data-testid={'BackToWizardButton'}
              onClick={() => {
                onClose();
              }}
            >
              Go back to the wizard
            </Button>
          )}
          {percent === 100 && (
            <Button
              variant="link"
              component="a"
              ouiaId="OpenPlaybookButton"
              data-testid={'OpenPlaybookButton'}
              href={remediationUrl(playbook.id)}
              onClick={() => {
                onClose();
                setOpen(false);
              }}
            >
              Open playbook {playbook.name}
            </Button>
          )}
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

Progress.propTypes = {
  onClose: PropTypes.func,
  setOpen: PropTypes.func,
  submitRemediation: PropTypes.func,
  setState: PropTypes.func,
  state: PropTypes.shape({
    id: PropTypes.string,
    percent: PropTypes.number.isRequired,
    failed: PropTypes.bool.isRequired,
    formValues: PropTypes.shape({
      [SELECT_PLAYBOOK]: PropTypes.string,
      [SYSTEMS]: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
    }),
  }),
};

export default Progress;
