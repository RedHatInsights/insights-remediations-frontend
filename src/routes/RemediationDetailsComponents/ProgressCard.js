import {
  Button,
  Card,
  CardBody,
  CardTitle,
  ProgressStep,
  ProgressStepper,
  Spinner,
  Title,
  Popover,
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
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { calculateActionPoints } from '../../components/helpers';
import { pluralize } from '../../Utilities/utils';

const ProgressCard = ({
  remediationStatus,
  permissions,
  readyOrNot,
  onNavigateToTab,
  details,
  remediationIssues,
}) => {
  const [openPopover, setOpenPopover] = useState(null);
  const { quickStarts } = useChrome();

  const MAX_SYSTEMS = 100;
  const MAX_ACTIONS = 1000;

  const actionPoints = useMemo(() => {
    return calculateActionPoints(remediationIssues);
  }, [remediationIssues]);

  const exceedsSystemsLimit = useMemo(() => {
    return (details?.system_count || 0) > MAX_SYSTEMS;
  }, [details?.system_count]);

  const exceedsActionsLimit = useMemo(() => {
    return actionPoints > MAX_ACTIONS;
  }, [actionPoints]);

  const exceedsExecutionLimits = exceedsSystemsLimit || exceedsActionsLimit;
  const systemsToRemove = useMemo(() => {
    return exceedsSystemsLimit ? (details?.system_count || 0) - MAX_SYSTEMS : 0;
  }, [exceedsSystemsLimit, details?.system_count]);

  const actionsToRemove = useMemo(() => {
    return exceedsActionsLimit ? actionPoints - MAX_ACTIONS : 0;
  }, [exceedsActionsLimit, actionPoints]);

  const executionLimitsMessage = useMemo(() => {
    if (!exceedsExecutionLimits) {
      return 'Within limits';
    }

    let message = `Exceeds limits. To execute in Red Hat Lightspeed remove `;

    if (exceedsSystemsLimit && exceedsActionsLimit) {
      message += `${systemsToRemove} or more systems, as well as ${actionsToRemove} or more actions from the plan.`;
    } else if (exceedsSystemsLimit) {
      message += `${systemsToRemove} or more systems from the plan.`;
    } else if (exceedsActionsLimit) {
      message += `${actionsToRemove} or more actions from the plan.`;
    }

    return message;
  }, [
    exceedsExecutionLimits,
    exceedsSystemsLimit,
    exceedsActionsLimit,
    systemsToRemove,
    actionsToRemove,
  ]);

  const errorCount = useMemo(() => {
    let count = 0;
    if (!permissions?.execute) count++;
    if (remediationStatus?.detailsError === 403) count++;
    if (remediationStatus?.connectedSystems === 0) count++;
    if (exceedsExecutionLimits) count++;
    return count;
  }, [
    permissions?.execute,
    remediationStatus?.detailsError,
    remediationStatus?.connectedSystems,
    exceedsExecutionLimits,
  ]);

  const renderStepTitle = (stepId, title, popoverContent, isError = false) => {
    return (
      <Popover
        isVisible={openPopover === stepId}
        shouldClose={() => setOpenPopover(null)}
        position="top"
        bodyContent={popoverContent}
        aria-label={`${title} popover`}
      >
        <button
          onClick={() => setOpenPopover(openPopover === stepId ? null : stepId)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            textUnderlineOffset: '2px',
            color: isError
              ? 'var(--pf-v6-global--danger-color--100)'
              : 'inherit',
            font: 'inherit',
            fontWeight: 'inherit',
          }}
        >
          {title}
        </button>
      </Popover>
    );
  };

  const executionLimitsPopoverContent = (
    <Flex
      direction={{ default: 'column' }}
      spaceItems={{ default: 'spaceItemsMd' }}
    >
      <Title headingLevel="h4">Red Hat Lightspeed execution limits</Title>
      <Content>
        <p>
          To execute a remediation plan using Insights, it must be within the
          limit of 100 systems or 1000 action points. Action points (pts) per
          issue type: Advisor: 20 pts, Vulnerability: 20 pts, Patch: 2 pts, and
          Compliance: 5 pts.
        </p>
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
        >
          Go to documentation
        </Button>
        <Content component="p">{executionLimitsMessage}</Content>
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
      <Content>
        <p>
          To execute remediation plans on connected remote host systems from
          within <strong>Red Hat Lightspeed</strong>, ensure that you have the
          Remediations administrator RBAC role. You can check your role settings
          in the console in Settings (⚙) &gt; User Access &gt; Groups. You
          might need to contact your organization administrator to confirm your
          user access settings and to apply the required permissions.
        </p>
      </Content>
      <Flex
        direction={{ default: 'column' }}
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
      <Content component="p">
        {permissions?.execute ? 'Authorized' : 'Not authorized'}
      </Content>
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
          To execute a remediation plan from Red Hat Lightspeed, your RHEL
          systems must be connected either directly via the &quot;rhc
          connect&quot; command or through a properly configured Red Hat
          Satellite server. For detailed troubleshooting guidance, review the{' '}
          <strong>Connection status</strong> details for each disconnected
          system.{' '}
          <Button
            variant="link"
            onClick={() => onNavigateToTab(null, 'systems')}
          >
            View systems
          </Button>
        </p>
      </Content>
      <Flex
        direction={{ default: 'column' }}
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
      <Content component="p">
        {`${remediationStatus?.connectedSystems || 0} (of ${remediationStatus?.totalSystems || 0}) connected systems`}
      </Content>
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
          Addressing errors in this section will ensure that your remediation
          plan is ready for execution?{' '}
          <InsightsLink
            to="https://docs.redhat.com/en/documentation/red_hat_lightspeed/1-latest/html-single/red_hat_lightspeed_remediations_guide/index#creating-remediation-plans_red-hat-lightspeed-remediation-guide"
            target="_blank"
            style={{ textDecoration: 'none' }}
          >
            Learn more{' '}
            <OpenDrawerRightIcon size="xl" className="pf-v6-u-ml-sm" />
          </InsightsLink>
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
              {renderStepTitle(
                'executionLimitsStep',
                'Red Hat Lightspeed execution limits',
                executionLimitsPopoverContent,
                exceedsExecutionLimits,
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
              {renderStepTitle(
                'permissionsStep',
                'User access permissions',
                permissionsPopoverContent,
              )}
            </span>
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
                      Remote Host Configuration
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
              {renderStepTitle(
                'RHCStep',
                'Remote Host Configuration Manager',
                <Content>
                  Information about Remote Host Configuration Manager.
                </Content>,
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
                      onClick={() => onNavigateToTab(null, 'systems')}
                    >
                      View systems
                    </Button>
                  </>
                ) : (
                  <>
                    {`${remediationStatus?.connectedSystems} (of ${remediationStatus?.totalSystems}) connected systems`}{' '}
                    <Button
                      variant="link"
                      onClick={() => onNavigateToTab(null, 'systems')}
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
              {renderStepTitle(
                'connectedSystemsStep',
                'Systems connected to Red Hat Lightspeed',
                connectedSystemsPopoverContent,
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
  remediationIssues: PropTypes.array,
};

export default ProgressCard;
