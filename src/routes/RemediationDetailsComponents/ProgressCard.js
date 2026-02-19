import {
  Button,
  Card,
  CardBody,
  CardTitle,
  ProgressStep,
  ProgressStepper,
  Spinner,
  Title,
  Flex,
  Content,
  Label,
} from '@patternfly/react-core';
import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  ExternalLinkAltIcon,
  OpenDrawerRightIcon,
} from '@patternfly/react-icons';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { calculateActionPointsFromSummary } from '../../components/helpers';
import { pluralize } from '../../Utilities/utils';
import {
  calculateExecutionLimits,
  EXECUTION_LIMITS_DESCRIPTION,
  getExecutionLimitsMessage,
  getExecutionLimitsPopoverMessage,
  calculateReadinessErrorCount,
  renderStepTitleWithPopover,
} from './helpers';

const ProgressCard = ({
  remediationStatus,
  permissions,
  readyOrNot,
  onNavigateToTab,
  details,
}) => {
  const [openPopover, setOpenPopover] = useState(null);
  const { quickStarts } = useChrome();

  const actionPoints = useMemo(() => {
    return calculateActionPointsFromSummary(details?.issue_count_details);
  }, [details?.issue_count_details]);

  const executionLimits = useMemo(() => {
    return calculateExecutionLimits(details, actionPoints);
  }, [details, actionPoints]);

  const { exceedsExecutionLimits } = executionLimits;

  const executionLimitsMessage = useMemo(() => {
    return getExecutionLimitsMessage(executionLimits);
  }, [executionLimits]);

  const executionLimitsPopoverMessage = useMemo(() => {
    return getExecutionLimitsPopoverMessage(executionLimits);
  }, [executionLimits]);

  const exceedsLimits = useMemo(() => {
    return (
      executionLimitsPopoverMessage.startsWith('Exceeds limits by') ||
      executionLimitsPopoverMessage === 'Exceeds limits'
    );
  }, [executionLimitsPopoverMessage]);

  const errorCount = useMemo(() => {
    return calculateReadinessErrorCount({
      hasExecutePermission: permissions?.execute,
      connectionError: remediationStatus?.connectionError,
      connectedSystems: remediationStatus?.connectedSystems,
      exceedsExecutionLimits,
    });
  }, [
    permissions?.execute,
    remediationStatus?.connectionError,
    remediationStatus?.connectedSystems,
    exceedsExecutionLimits,
  ]);

  const isRhcNotEnabled = useMemo(() => {
    const error = remediationStatus?.connectionError?.errors?.[0];
    return (
      error?.status === 403 ||
      error?.status === 503 ||
      error?.code === 'DEPENDENCY_UNAVAILABLE'
    );
  }, [remediationStatus?.connectionError]);

  const popoverState = { openPopover, setOpenPopover };

  const executionLimitsPopoverContent = (
    <Flex
      direction={{ default: 'column' }}
      spaceItems={{ default: 'spaceItemsMd' }}
    >
      <Title headingLevel="h4">Red Hat Lightspeed execution limits</Title>
      <Content>
        <p>{EXECUTION_LIMITS_DESCRIPTION}</p>
      </Content>
      <Flex
        direction={{ default: 'column' }}
        spaceItems={{ default: 'spaceItemsSm' }}
      >
        <Button
          variant="link"
          icon={<ExternalLinkAltIcon />}
          component="a"
          href="https://docs.redhat.com/en/documentation/red_hat_lightspeed/1-latest/html-single/red_hat_lightspeed_remediations_guide/index"
          target="_blank"
          rel="noopener noreferrer"
          style={{ alignSelf: 'flex-start' }}
        >
          Go to documentation
        </Button>
      </Flex>
    </Flex>
  );

  const executionLimitsDescription = useMemo(() => {
    return <span className="pf-v6-u-color-100">{executionLimitsMessage}</span>;
  }, [executionLimitsMessage]);

  const permissionsPopoverContent = (
    <Flex
      direction={{ default: 'column' }}
      spaceItems={{ default: 'spaceItemsMd' }}
    >
      <Title headingLevel="h4">User access permissions</Title>
      <Content>
        <p>
          To execute remediation plans on connected remote host systems from
          within Red Hat Lightspeed, ensure that you have the Remediations
          administrator RBAC role. You can check your role settings in the
          console in Settings (⚙) &gt; User Access &gt; Groups. You might need
          to contact your organization administrator to confirm your user access
          settings and to apply the required permissions.
        </p>
      </Content>
      <Flex
        direction={{ default: 'row' }}
        spaceItems={{ default: 'spaceItemsSm' }}
      >
        <Button
          variant="secondary"
          onClick={() =>
            quickStarts?.activateQuickstart('insights-remediate-plan-create')
          }
        >
          Open the quick start
        </Button>
        <Button
          variant="link"
          icon={<ExternalLinkAltIcon />}
          component="a"
          href="https://docs.redhat.com/en/documentation/red_hat_hybrid_cloud_console/1-latest/html/user-access-configuration-guide-for-role-based-access-control-rbac/index"
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to documentation
        </Button>
      </Flex>
    </Flex>
  );

  const connectedSystemsPopoverContent = (
    <Flex
      direction={{ default: 'column' }}
      spaceItems={{ default: 'spaceItemsMd' }}
    >
      <Title headingLevel="h4">Lightspeed connected systems</Title>
      <Content>
        <p>
          To execute a remediation plan from Red Hat Lightspeed , your RHEL
          systems must be connected either directly via the &quot;rhc
          connect&quot; command or through a properly configured Red Hat
          Satellite server. For detailed troubleshooting guidance, review the{' '}
          <strong>Connection status</strong> details for each disconnected
          system.{' '}
          <Button
            type="button"
            variant="link"
            isInline
            //TODO: Update after PF issue is resolved
            onClick={() => {
              setOpenPopover(null);
              setTimeout(() => {
                onNavigateToTab(null, 'plannedRemediations:systems');
              }, 100);
            }}
          >
            View systems
          </Button>
        </p>
      </Content>
      <Flex
        direction={{ default: 'row' }}
        spaceItems={{ default: 'spaceItemsSm' }}
      >
        <Button
          variant="secondary"
          onClick={() =>
            quickStarts?.activateQuickstart('insights-remediate-plan-create')
          }
        >
          Open the quick start
        </Button>
        <Button
          variant="link"
          icon={<ExternalLinkAltIcon />}
          component="a"
          href="https://docs.redhat.com/en/documentation/red_hat_lightspeed/1-latest/html-single/red_hat_lightspeed_remediations_guide/index#host-communication-with-red-hat-lightspeed_red-hat-lightspeed-remediation-guide"
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to documentation
        </Button>
      </Flex>
    </Flex>
  );

  const rhcPopoverContent = (
    <Flex
      direction={{ default: 'column' }}
      spaceItems={{ default: 'spaceItemsMd' }}
    >
      <Title headingLevel="h4">Remote Host Configuration Manager</Title>
      <Content>
        <p>
          To allow users to execute a remediation plan on a remote system from{' '}
          Red Hat Lightspeed, you must configure the Remote Host Configuration
          Manager settings in the Lightspeed UI. You can find the settings in
          the console under Inventory &gt; System Configurations &gt; Remote
          Host Configuration.
        </p>
      </Content>
      <Flex
        direction={{ default: 'row' }}
        spaceItems={{ default: 'spaceItemsSm' }}
      >
        <Button
          variant="secondary"
          onClick={() =>
            quickStarts?.activateQuickstart('insights-remediate-plan-create')
          }
        >
          Open the quick start
        </Button>
        <Button
          variant="link"
          icon={<ExternalLinkAltIcon />}
          component="a"
          href="https://docs.redhat.com/en/documentation/red_hat_insights/1-latest/html/remote_host_configuration_and_management/index"
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to documentation
        </Button>
      </Flex>
    </Flex>
  );

  return permissions === undefined || remediationStatus.areDetailsLoading ? (
    <Spinner />
  ) : (
    <Card isFullHeight>
      <CardTitle>
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsCenter' }}
        >
          <Title headingLevel="h4" size="xl">
            Execution readiness summary
          </Title>
          {readyOrNot ? (
            <Label status="success">Ready</Label>
          ) : (
            <Label status="danger" variant="outline">
              {`Not ready (${pluralize(errorCount, 'error')})`}
            </Label>
          )}
        </Flex>
      </CardTitle>

      <CardBody>
        <p className="pf-v6-u-mb-md">
          Address errors in this section to ensure that your remediation plan is
          ready for execution.{' '}
          <Button
            variant="link"
            onClick={() =>
              quickStarts?.activateQuickstart('insights-remediate-plan-create')
            }
          >
            Learn more
            <OpenDrawerRightIcon size="xl" className="pf-v6-u-ml-sm" />
          </Button>
        </p>

        <ProgressStepper
          isVertical={true}
          aria-label="Remediation Readiness card"
        >
          <ProgressStep
            variant={exceedsExecutionLimits ? 'danger' : 'success'}
            description={executionLimitsDescription}
            id="executionLimitsStep"
            titleId="ExecutionLimitsStep"
            aria-label="ExecutionLimitsStep"
          >
            <span className="pf-v6-u-color-100">
              {renderStepTitleWithPopover(
                'executionLimitsStep',
                'Execution limits',
                executionLimitsPopoverContent,
                popoverState,
                exceedsLimits,
              )}
            </span>
          </ProgressStep>
          <ProgressStep
            variant={permissions?.execute ? 'success' : 'danger'}
            description={
              <span className="pf-v6-u-color-100">
                {permissions?.execute ? (
                  'Authorized'
                ) : (
                  <>
                    Not authorized. Check your user access permissions to ensure
                    that you have the Remediations administrator RBAC role.
                  </>
                )}
              </span>
            }
            id="permissionsStep"
            titleId="PermissionsStep"
            aria-label="PermissionsStep1"
          >
            <span className="pf-v6-u-color-100">
              {renderStepTitleWithPopover(
                'permissionsStep',
                'User access permissions',
                permissionsPopoverContent,
                popoverState,
              )}
            </span>
          </ProgressStep>
          <ProgressStep
            variant={isRhcNotEnabled ? 'danger' : 'success'}
            description={
              <span className="pf-v6-u-color-100">
                {isRhcNotEnabled ? (
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
                      Remote Host Configuration
                    </a>
                    .
                  </>
                ) : (
                  'Enabled'
                )}
              </span>
            }
            id="RHCStep"
            titleId="RHCStep-title"
            aria-label="RHCStep2"
          >
            <span className="pf-v6-u-color-100">
              {renderStepTitleWithPopover(
                'RHCStep',
                'Remote Host Configuration Manager',
                rhcPopoverContent,
                popoverState,
              )}
            </span>
          </ProgressStep>
          <ProgressStep
            variant={
              remediationStatus?.connectedSystems !== 0 ? 'success' : 'danger'
            }
            description={
              <div className="pf-v6-u-color-100">
                {remediationStatus?.connectedSystems === 0 ? (
                  <>
                    No connected systems. You must connect one or more systems
                    to execute this plan. Review the{' '}
                    <strong>Connection status</strong> details for each
                    disconnected system{' '}
                    <Button
                      variant="link"
                      onClick={() =>
                        onNavigateToTab(null, 'plannedRemediations:systems')
                      }
                    >
                      View systems
                    </Button>
                  </>
                ) : (
                  <>
                    {`${remediationStatus?.connectedSystems} (of ${remediationStatus?.totalSystems}) connected systems`}{' '}
                    <Button
                      variant="link"
                      onClick={() =>
                        onNavigateToTab(null, 'plannedRemediations:systems')
                      }
                    >
                      View systems
                    </Button>
                  </>
                )}
              </div>
            }
            id="connectedSystemsStep"
            titleId="connectedSystemsStep-title"
            aria-label="connectedSystemsStep"
          >
            <span className="pf-v6-u-color-100">
              {renderStepTitleWithPopover(
                'connectedSystemsStep',
                'Systems connected to Red Hat Lightspeed',
                connectedSystemsPopoverContent,
                popoverState,
                remediationStatus?.connectedSystems === 0,
              )}
            </span>
          </ProgressStep>
        </ProgressStepper>
      </CardBody>
    </Card>
  );
};

ProgressCard.propTypes = {
  remediationStatus: PropTypes.any,
  permissions: PropTypes.object,
  readyOrNot: PropTypes.bool,
  onNavigateToTab: PropTypes.func,
  details: PropTypes.object,
};

export default ProgressCard;
