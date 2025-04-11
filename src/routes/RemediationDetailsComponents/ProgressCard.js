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
          To be able to execute a remediation you need to have the Remediations
          administrator role granted to your account; the Remote Host
          Configuration Manager must be enabled; and the Remote Host
          Configuration (RHC) client must be active on the systems in your
          infrastructure.
        </p>
        <ProgressStepper
          isVertical={true}
          aria-label="Remediation Readiness card"
        >
          <ProgressStep
            variant={permissions?.execute ? 'success' : 'danger'}
            description={`Remediations administrator role ${
              permissions?.execute ? '' : 'not '
            }granted.`}
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
              readyOrNot ? `Ready for execution` : 'Cannot be executed'
            }
            id="readyStep"
            titleId="readyStep-title"
            aria-label="Ready step"
          >
            {readyOrNot ? `Ready for execution` : 'Not ready for execution'}
          </ProgressStep>
        </ProgressStepper>
      </CardBody>
      <CardFooter className="pf-v5-u-font-size-sm">
        Need help?{' '}
        <InsightsLink
          to={
            'https://docs.redhat.com/en/documentation/red_hat_insights/1-latest/html-single/red_hat_insights_remediations_guide/index#remediations-overview_red-hat-insights-remediation-guide'
          }
        >
          <Button variant="link" className="pf-v5-u-font-size-sm">
            Learn more about enabling host communication with Insights.{' '}
            <ExternalLinkAltIcon />
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
