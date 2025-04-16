import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  ProgressStep,
  ProgressStepper,
  Spinner,
  Title,
} from '@patternfly/react-core';
import React from 'react';
import PropTypes from 'prop-types';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

const ProgressCard = ({ remediationStatus, permissions, readyOrNot }) => {
  return permissions === undefined ? (
    <Spinner />
  ) : (
    <Card isFullHeight>
      <CardTitle>
        <Title headingLevel="h4" size="xl">
          Remediation readiness
        </Title>
      </CardTitle>

      <CardBody>
        <p className="pf-v5-u-font-size-sm pf-v5-u-mb-md">
          To pass the execution readiness check, ensure you have the required
          permissions and that the Remote Host Configuration Manager is enabled
          for the affected systems in Insights. The Remote Host Configuration
          (RHC) client must also be active on every system. If the readiness
          check fails, the Execute button is inactive.
        </p>
        <ProgressStepper
          isVertical={true}
          aria-label="Remediation Readiness card"
        >
          <ProgressStep
            variant={permissions?.execute ? 'success' : 'danger'}
            description={`You ${
              permissions?.execute ? '' : 'do not'
            } have the required permissions.`}
            id="permissionsStep"
            titleId="PermissionsStep"
            aria-label="PermissionsStep1"
          >
            User access permissions
          </ProgressStep>
          <ProgressStep
            variant={
              remediationStatus?.detailsError !== 403 ? 'success' : 'danger'
            }
            description={
              remediationStatus?.detailsError !== 403
                ? 'Enabled'
                : 'Not enabled'
            }
            id="RHCStep"
            titleId="RHCStep-title"
            aria-label="RHCStep2"
          >
            Remote Host Configuration Manager (RHC)
          </ProgressStep>
          <ProgressStep
            variant={
              remediationStatus?.connectedSystems !== 0 ? 'success' : 'danger'
            }
            description={`Connected Systems (${
              remediationStatus?.connectedSystems +
              '/' +
              remediationStatus?.totalSystems
            })`}
            id="connectedSystemsStep"
            titleId="connectedSystemsStep-title"
            aria-label="connectedSystemsStep"
          >
            Connected systems
          </ProgressStep>
          <ProgressStep
            variant={readyOrNot ? `success` : 'danger'}
            description={
              readyOrNot
                ? `Ready for execution.`
                : 'Execution readiness check failed.'
            }
            id="readyStep"
            titleId="readyStep-title"
            aria-label="Ready step"
          >
            {readyOrNot ? `Ready for execution.` : 'Not ready for execution'}
          </ProgressStep>
        </ProgressStepper>
      </CardBody>
      <CardFooter className="pf-v5-u-font-size-sm">
        Get ready to execute your remediation plan{' '}
        <InsightsLink
          to={
            'https://docs.redhat.com/en/documentation/red_hat_insights/1-latest/html-single/red_hat_insights_remediations_guide/index#executing-playbooks-from-insights_remediations-from-insights'
          }
        >
          <Button variant="link" className="pf-v5-u-font-size-sm">
            Learn more. <ExternalLinkAltIcon />
          </Button>{' '}
        </InsightsLink>
      </CardFooter>
    </Card>
  );
};

ProgressCard.propTypes = {
  remediationStatus: PropTypes.any,
  permissions: PropTypes.object,
  readyOrNot: PropTypes.bool,
};

export default ProgressCard;
