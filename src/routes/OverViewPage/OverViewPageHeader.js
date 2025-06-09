import React from 'react';
import {
  Button,
  Flex,
  FlexItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { OpenDrawerRightIcon } from '@patternfly/react-icons';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { RemediationsPopover } from '../RemediationsPopover';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import PropTypes from 'prop-types';

export const OverViewPageHeader = ({ hasRemediations }) => {
  const { quickStarts } = useChrome();

  return (
    <PageHeader className="pf-v5-u-pb-lg">
      <Flex
        justifyContent={{ default: 'spaceBetween' }}
        alignItems={{ default: 'alignItemsFlexStart' }}
      >
        <FlexItem flex={{ default: 'flex_1' }}>
          <Stack hasGutter>
            <StackItem>
              <PageHeaderTitle
                title={
                  <Flex
                    spaceItems={{ default: 'spaceItemsSm' }}
                    alignItems={{ default: 'alignItemsCenter' }}
                  >
                    <FlexItem>Remediation Plans</FlexItem>
                    <FlexItem>
                      <RemediationsPopover />
                    </FlexItem>
                  </Flex>
                }
              />
            </StackItem>

            <StackItem>
              <p>
                Remediation plans use Ansible playbooks to resolve issues
                identified by Red Hat Insights.
              </p>
            </StackItem>
          </Stack>
        </FlexItem>

        {hasRemediations && (
          <FlexItem>
            <Button
              variant="secondary"
              onClick={() =>
                quickStarts?.activateQuickstart(
                  'insights-remediate-plan-create'
                )
              }
            >
              Launch Quick Start
              <OpenDrawerRightIcon className="pf-v5-u-ml-sm" />
            </Button>
          </FlexItem>
        )}
      </Flex>
    </PageHeader>
  );
};

OverViewPageHeader.propTypes = {
  hasRemediations: PropTypes.bool,
};
