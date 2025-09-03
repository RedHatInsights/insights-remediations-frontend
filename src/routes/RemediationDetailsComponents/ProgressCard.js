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
import { OpenDrawerRightIcon } from '@patternfly/react-icons';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { useFeatureFlag } from '../../Utilities/Hooks/useFeatureFlag';

const ProgressCard = ({
  remediationStatus,
  permissions,
  readyOrNot,
  onNavigateToTab,
}) => {
  const isLightspeedRebrandEnabled = useFeatureFlag(
    'platform.lightspeed-rebrand',
  );
  const { quickStarts } = useChrome();

  return permissions === undefined || remediationStatus.areDetailsLoading ? (
    <Spinner />
  ) : (
    <Card isFullHeight>
      <CardTitle>
        <Title headingLevel="h4" size="xl">
          Execution readiness
        </Title>
      </CardTitle>

      <CardBody>
        <p className="pf-v6-u-font-size-sm pf-v6-u-mb-md">
          To pass the execution readiness check, ensure you have the required
          permissions and that the Remote Host Configuration Manager is enabled
          for the affected systems in{' '}
          {isLightspeedRebrandEnabled ? 'Red Hat Lightspeed' : 'Insights'}. The
          Remote Host Configuration (RHC) client must also be active on every
          system. If the readiness check fails, the <b>Execute</b> button is
          inactive.
        </p>
        <ProgressStepper
          isVertical={true}
          aria-label="Remediation Readiness card"
        >
          <ProgressStep
            variant={permissions?.execute ? 'success' : 'danger'}
            description={
              <span className="pf-v6-u-color-100">
                {permissions?.execute ? (
                  'Authorized'
                ) : (
                  <>
                    You do not have the required&nbsp;
                    <strong>Remediations administrator</strong>&nbsp;RBAC role.
                    Contact your organization administrator to request access.
                  </>
                )}
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
              <span className="pf-v6-u-color-100">
                {remediationStatus?.detailsError !== 403 ? (
                  'Enabled'
                ) : (
                  <>
                    RHC Manager is not enabled. Enable it in&nbsp;
                    <a
                      href="https://console.redhat.com/insights/connector"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        textDecoration: 'none',
                        color: 'var(--pf-v6-global--link--Color)',
                      }}
                    >
                      Remote Host Configuration&nbsp;(RHC)
                    </a>
                    .
                  </>
                )}
              </span>
            }
            id="RHCStep"
            titleId="RHCStep-title"
            aria-label="RHCStep2"
          >
            <span className="pf-v6-u-color-100">
              Remote Host Configuration Manager (RHC)
            </span>
          </ProgressStep>
          <ProgressStep
            variant={
              remediationStatus?.connectedSystems !== 0 ? 'success' : 'danger'
            }
            description={
              <div className="pf-v6-u-color-100">
                {`${remediationStatus?.connectedSystems} (of ${remediationStatus?.totalSystems}) connected systems`}{' '}
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
            <span className="pf-v6-u-color-100">Connected systems</span>
          </ProgressStep>
          <ProgressStep
            variant={readyOrNot ? `success` : 'danger'}
            id="readyStep"
            titleId="readyStep-title"
            aria-label="Ready step"
          >
            <span className="pf-v6-u-font-weight-bold pf-v6-u-color-100">
              {readyOrNot ? 'Ready for execution' : 'Not ready for execution'}
            </span>
          </ProgressStep>
        </ProgressStepper>
      </CardBody>
      <CardFooter className="pf-v6-u-font-size-sm">
        Need help to pass the remediations execution readiness check?
        <Button
          icon={<OpenDrawerRightIcon data-testid="open-drawer-icon" />}
          onClick={() =>
            quickStarts?.activateQuickstart('insights-remediate-plan-create')
          }
          variant="link"
          className="pf-v6-u-font-size-sm"
        >
          Learn more
        </Button>
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
