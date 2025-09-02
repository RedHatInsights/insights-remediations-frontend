import React from 'react';
import {
  Button,
  Flex,
  Popover,
  Content,
  ContentVariants,
  Title,
} from '@patternfly/react-core';
import {
  ExternalLinkAltIcon,
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';
import { useFeatureFlag } from '../Utilities/Hooks/useFeatureFlag';

export const RemediationsPopover = () => {
  const isLightspeedRebrandEnabled = useFeatureFlag(
    'platform.lightspeed-rebrand',
  );
  return (
    <Popover
      aria-label="Remediations popover"
      headerContent={<Title headingLevel="h4">{'About remediations'}</Title>}
      position="right"
      maxWidth="650px"
      bodyContent={
        <Content>
          <Flex direction={{ default: 'column' }}>
            <Content component={ContentVariants.p}>
              Remediations allows you to resolve Advisor recommendations,
              content advisories, vulnerability CVEs, and failed compliance
              rules that Red Hat{' '}
              {isLightspeedRebrandEnabled ? 'Lightspeed' : 'Insights'} has
              identified on your connected RHEL systems. Remediation plans use
              Ansible playbooks to enable plan execution without the need for
              any additional subscriptions or tools. After creating a
              remediation plan, you can download or execute remediation plans on
              connected RHEL systems or utilize integrations with Ansible
              Automation Platform and Satellite to enable issue resolution
              across your Red Hat portfolio.
            </Content>
            <span>
              <a
                href={
                  'https://docs.redhat.com/en/documentation/red_hat_insights/1-latest/html/red_hat_insights_remediations_guide/index'
                }
                target="_blank"
                rel="noreferrer"
              >
                Fixing issues on RHEL systems with remediation plans
                <ExternalLinkAltIcon className="pf-v6-u-ml-xs" />
              </a>
            </span>
            <span>
              <a
                href={
                  'https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html/using_automation_execution/controller-setting-up-insights#controller-setting-up-insights'
                }
                target="_blank"
                rel="noreferrer"
              >
                Setting up Insights for AAP remediations
                <ExternalLinkAltIcon className="pf-v6-u-ml-xs" />
              </a>
            </span>
            <span>
              <a
                href={
                  'https://docs.redhat.com/en/documentation/red_hat_satellite/6.16/html/managing_hosts/monitoring-hosts-by-using-red-hat-insights#Creating_an_Insights_Remediation_Plan_for_Hosts_managing-hosts'
                }
                target="_blank"
                rel="noreferrer"
              >
                Creating an Insights remediation plan for hosts in Satellite
                <ExternalLinkAltIcon className="pf-v6-u-ml-xs" />
              </a>
            </span>
          </Flex>
        </Content>
      }
    >
      <Button
        icon={<OutlinedQuestionCircleIcon />}
        variant="plain"
        aria-label="Open Remediations popover"
        style={{ padding: 0 }}
        ouiaId="AboutRemediationsPopover"
      />
    </Popover>
  );
};
