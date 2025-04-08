import React from 'react';
import { Flex, FlexItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import { RemediationsPopover } from './RemediationsPopover';

export const OverViewPageHeader = () => (
  <PageHeader>
    <PageHeaderTitle
      className="pf-v5-u-mb-lg"
      title={
        <Flex
          direction={{ default: 'row' }}
          spaceItems={{ default: 'spaceItemsSm' }}
          alignItems={{ default: 'alignItemsCenter' }}
        >
          <FlexItem>Remediation plans</FlexItem>
          <FlexItem>
            <RemediationsPopover />
          </FlexItem>
        </Flex>
      }
    />
    <div>
      <p>
        Remediation plans use Ansible playbooks to resolve issues identified by
        Red Hat Insights.
        <InsightsLink
          style={{ textDecoration: 'none' }}
          className="pf-v5-u-ml-md"
          to={
            'https://docs.redhat.com/en/documentation/red_hat_insights/1-latest/html/red_hat_insights_remediations_guide/index'
          }
        >
          Learn more <ExternalLinkAltIcon />
        </InsightsLink>
      </p>
    </div>
  </PageHeader>
);
