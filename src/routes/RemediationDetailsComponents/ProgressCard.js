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

const ProgressCard = ({
  remediationStatus,
  permissions,
  readyOrNot,
  onNavigateToTab,
}) => {
  return permissions === undefined ? (
    <Spinner />
  ) : (
    <Card isFullHeight>
      <CardTitle>
        <Title headingLevel="h4" size="xl">
          Execution readiness
        </Title>
      </CardTitle>

      <CardBody>
        <p className="pf-v5-u-font-size-sm pf-v5-u-mb-md">
          To pass the execution readiness check, ensure you have the required
          permissions and that the Remote Host Configuration Manager is enabled
          for the affected systems in Insights. The Remote Host Configuration
          (RHC) client must also be active on every system. If the readiness
          check fails, the <b>Execute</b> button is inactive.
        </p>
        <ProgressStepper
          isVertical={true}
          aria-label="Remediation Readiness card"
        >
          <ProgressStep
            variant={permissions?.execute ? 'success' : 'danger'}
            description={
              <span className="pf-v5-u-color-100">
                {permissions?.execute ? 'Authorized' : 'Not authorized'}
              </span>
            }
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
              <span className="pf-v5-u-color-100">
                {remediationStatus?.detailsError !== 403
                  ? 'Enabled'
                  : 'Not enabled'}
              </span>
            }
            id="RHCStep"
            titleId="RHCStep-title"
            aria-label="RHCStep2"
          >
            <span className="pf-v5-u-color-100">
              Remote Host Configuration Manager (RHC)
            </span>
          </ProgressStep>
          <ProgressStep
            variant={
              remediationStatus?.connectedSystems !== 0 ? 'success' : 'danger'
            }
            description={
              <div className="pf-v5-u-color-100">
                {`${
                  remediationStatus?.connectedSystems +
                  '(of ' +
                  remediationStatus?.totalSystems
                }) connected systems`}
                <Button
                  variant="link"
                  onClick={() => onNavigateToTab(null, 'systems')}
                >
                  View systems
                </Button>
              </div>
            }
            id="connectedSystemsStep"
            titleId="connectedSystemsStep-title"
            aria-label="connectedSystemsStep"
          >
            <span className="pf-v5-u-color-100">Connected systems</span>
          </ProgressStep>
          <ProgressStep
            variant={readyOrNot ? `success` : 'danger'}
            description={
              <span className="pf-v5-u-color-100">
                {readyOrNot
                  ? 'Ready for execution.'
                  : 'Execution readiness check failed'}
              </span>
            }
            id="readyStep"
            titleId="readyStep-title"
            aria-label="Ready step"
          >
            <span className="pf-v5-u-font-weight-bold pf-v5-u-color-100">
              {readyOrNot ? 'Ready for execution.' : 'Not ready for execution'}
            </span>
          </ProgressStep>
        </ProgressStepper>
      </CardBody>
      <CardFooter className="pf-v5-u-font-size-sm">
        Need help to pass the remediations execution readiness check? Learn
        more.
        <InsightsLink
          to={
            'https://docs.redhat.com/en/documentation/red_hat_insights/1-latest/html-single/red_hat_insights_remediations_guide/index#executing-playbooks-from-insights_remediations-from-insights'
          }
          target="_blank"
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
  onNavigateToTab: PropTypes.func,
};

export default ProgressCard;
