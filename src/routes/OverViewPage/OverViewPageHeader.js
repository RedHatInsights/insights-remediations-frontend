import React, { useState } from 'react';
import {
  Button,
  Dropdown,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { EllipsisVIcon, OpenDrawerRightIcon } from '@patternfly/react-icons';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { RemediationsPopover } from '../RemediationsPopover';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import PropTypes from 'prop-types';
import RetentionPolicyModal from '../../components/RetentionPolicyModal';
import RetentionPolicyDropdownItem from '../../components/RetentionPolicyDropdownItem';
import { useIsOrgAdmin } from '../../Utilities/Hooks/useIsOrgAdmin';

export const OverViewPageHeader = ({ hasRemediations }) => {
  const { quickStarts } = useChrome();
  const { isOrgAdmin: canManageRetentionPolicy, isLoading: isOrgAdminLoading } =
    useIsOrgAdmin();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [retentionPolicyModalOpen, setRetentionPolicyModalOpen] =
    useState(false);

  return (
    <PageHeader className="pf-v6-u-pb-lg">
      {retentionPolicyModalOpen && (
        <RetentionPolicyModal
          isOpen={retentionPolicyModalOpen}
          onClose={() => setRetentionPolicyModalOpen(false)}
        />
      )}
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
                identified by Red Hat Lightspeed.
              </p>
            </StackItem>
          </Stack>
        </FlexItem>

        <FlexItem>
          <Flex
            spaceItems={{ default: 'spaceItemsSm' }}
            alignItems={{ default: 'alignItemsCenter' }}
          >
            {hasRemediations && (
              <FlexItem>
                <Button
                  icon={<OpenDrawerRightIcon className="pf-v6-u-ml-sm" />}
                  variant="secondary"
                  onClick={() =>
                    quickStarts?.activateQuickstart(
                      'insights-remediate-plan-create',
                    )
                  }
                >
                  Launch Quick Start
                </Button>
              </FlexItem>
            )}
            <FlexItem>
              <Dropdown
                onSelect={() => setDropdownOpen(false)}
                toggle={(toggleRef) => (
                  <MenuToggle
                    ref={toggleRef}
                    variant="plain"
                    onClick={() => setDropdownOpen((value) => !value)}
                    isExpanded={dropdownOpen}
                    aria-label="Overview page actions"
                  >
                    <EllipsisVIcon />
                  </MenuToggle>
                )}
                isOpen={dropdownOpen}
                popperProps={{ position: 'right' }}
              >
                <DropdownList>
                  <RetentionPolicyDropdownItem
                    canManageRetentionPolicy={canManageRetentionPolicy}
                    isLoading={isOrgAdminLoading}
                    onClick={() => setRetentionPolicyModalOpen(true)}
                  />
                </DropdownList>
              </Dropdown>
            </FlexItem>
          </Flex>
        </FlexItem>
      </Flex>
    </PageHeader>
  );
};

OverViewPageHeader.propTypes = {
  hasRemediations: PropTypes.bool,
};
