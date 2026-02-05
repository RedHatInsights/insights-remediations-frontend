import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Button,
  Switch,
  Title,
  Content,
  Spinner,
  Flex,
  TextInput,
  ValidatedOptions,
  FormGroup,
  Popover,
  FlexItem,
  Alert,
  Skeleton,
} from '@patternfly/react-core';
import {
  CheckIcon,
  ExternalLinkAltIcon,
  OutlinedQuestionCircleIcon,
  PencilAltIcon,
  TimesIcon,
} from '@patternfly/react-icons';
import { formatDate } from '../Cells';
import { useVerifyName } from '../../Utilities/useVerifyName';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import { execStatus } from './helpers';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import { useFeatureFlag } from '../../Utilities/Hooks/useFeatureFlag';
import { pluralize } from '../../Utilities/utils';
import useRemediations from '../../Utilities/Hooks/api/useRemediations';

const DetailsCard = ({
  details,
  updateRemPlan,
  onNavigateToTab,
  allRemediations,
  refetch,
  remediationPlaybookRuns,
  refetchAllRemediations,
  isPlaybookRunsLoading,
}) => {
  const isLightspeedRebrandEnabled = useFeatureFlag(
    'platform.lightspeed-rebrand',
  );
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(details?.name);
  const [rebootToggle, setRebootToggle] = useState(details?.auto_reboot);
  const [hasResolutionsAvailable, setHasResolutionsAvailable] = useState(false);
  const [isCheckingResolutions, setIsCheckingResolutions] = useState(true);
  const addNotification = useAddNotification();
  //This is paginated, so we must loop through issues until we find a batch with multiple resolutions or we reach the end of the issues.
  const { fetch: fetchRemediationIssues } = useRemediations(
    'getRemediationIssues',
    {
      skip: true,
      batched: true,
      batch: { batchSize: 50 },
    },
  );

  const checkResolutionsAvailable = useCallback(async () => {
    if (!details?.id) {
      setIsCheckingResolutions(false);
      return;
    }

    setIsCheckingResolutions(true);
    const BATCH_SIZE = 50;
    let offset = 0;
    let foundMultipleResolutions = false;

    try {
      while (!foundMultipleResolutions) {
        const response = await fetchRemediationIssues({
          id: details.id,
          limit: BATCH_SIZE,
          offset: offset,
        });

        const issues = response?.data || [];
        const total = response?.meta?.total || 0;

        // Check if any issue in this batch has multiple resolutions
        foundMultipleResolutions = issues.some(
          (issue) => issue?.resolutions_available > 1,
        );

        if (foundMultipleResolutions) {
          setHasResolutionsAvailable(true);
          setIsCheckingResolutions(false);
          return;
        }

        // Check if we've fetched all issues
        offset += issues.length;
        if (offset >= total || issues.length === 0) {
          setHasResolutionsAvailable(false);
          setIsCheckingResolutions(false);
          return;
        }
      }
    } catch (error) {
      console.error('Error checking resolutions:', error);
      setHasResolutionsAvailable(false);
      setIsCheckingResolutions(false);
    }
  }, [details?.id, fetchRemediationIssues]);

  useEffect(() => {
    checkResolutionsAvailable();
  }, [checkResolutionsAvailable]);

  useEffect(() => {
    setValue(details?.name || '');
  }, [details?.name]);

  const [isVerifyingName, isDuplicate] = useVerifyName(value, allRemediations);

  const nameStatus = (() => {
    if (isVerifyingName) return 'checking';
    if (!value || value.trim() === '') return 'empty';
    if (value === details?.name) return 'unchanged';
    if (isDuplicate) return 'duplicate';
    return 'valid';
  })();

  const validationState = ['empty', 'duplicate'].includes(nameStatus)
    ? ValidatedOptions.error
    : ValidatedOptions.default;

  const onSubmit = async () => {
    try {
      await updateRemPlan({
        id: details.id,
        name: value,
      }).then(async () => {
        await refetch();
        await refetchAllRemediations();
      });

      addNotification({
        title: `Remediation plan renamed`,
        variant: 'success',
        dismissable: true,
        autoDismiss: true,
      });

      setEditing(false);
    } catch (error) {
      console.error(error);
      addNotification({
        title: `Failed to update playbook name`,
        variant: 'danger',
        dismissable: true,
        autoDismiss: true,
      });
    }
  };
  if (!details) {
    return <Spinner />;
  }
  const onToggleAutoreboot = async () => {
    setRebootToggle(!rebootToggle);
    try {
      await updateRemPlan({ id: details.id, auto_reboot: !rebootToggle });
      await refetch();
    } catch (error) {
      console.error(error);
      // Revert toggle on error
      setRebootToggle(rebootToggle);
      addNotification({
        title: 'Failed to update auto-reboot setting',
        variant: 'danger',
        dismissable: true,
        autoDismiss: true,
      });
    }
  };

  const formatedDate = new Date(remediationPlaybookRuns?.updated_at);

  return (
    <Card isFullHeight>
      <CardTitle>
        <Flex
          direction={{ default: 'column' }}
          spaceItems={{ default: 'spaceItemsMd' }}
        >
          <Flex
            justifyContent={{ default: 'justifyContentSpaceBetween' }}
            alignItems={{ default: 'alignItemsCenter' }}
          >
            <Title headingLevel="h4" size="xl">
              Details
            </Title>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              spaceItems={{ default: 'spaceItemsSm' }}
              style={{ fontWeight: 'normal' }}
            >
              <Switch
                id="autoreboot-switch"
                isChecked={rebootToggle}
                onChange={onToggleAutoreboot}
                className="pf-v6-u-font-size-sm"
                style={{ fontSize: 'var(--pf-t--global--font-size--sm)' }}
              />
              <span className="pf-v6-u-font-size-sm">
                Auto-reboot:{rebootToggle ? ' On' : ' Off'}
              </span>
            </Flex>
          </Flex>
          <Content
            component="p"
            style={{ wordBreak: 'break-word', fontWeight: 'normal' }}
          >
            New to remediating through{' '}
            {isLightspeedRebrandEnabled ? 'Red Hat Lightspeed' : 'Insights'}?{' '}
            <InsightsLink
              to={
                'https://docs.redhat.com/en/documentation/red_hat_lightspeed/1-latest/html-single/red_hat_lightspeed_remediations_guide/index#creating-remediation-plans_red-hat-lightspeed-remediation-guide'
              }
              target="_blank"
              style={{ textDecoration: 'none' }}
              className="pf-v6-u-ml-sm"
            >
              Learn more
              <ExternalLinkAltIcon size="md" className="pf-v6-u-ml-sm" />
            </InsightsLink>
          </Content>
        </Flex>
      </CardTitle>
      <CardBody>
        <DescriptionList
          orientation={{
            sm: 'vertical',
            md: 'vertical',
            lg: 'vertical',
            xl: 'vertical',
            '2xl': 'vertical',
          }}
        >
          {/* Editable Name */}
          <DescriptionListGroup>
            <DescriptionListTerm>
              <span>Name</span>
              <Button
                icon={
                  <PencilAltIcon
                    color={
                      editing
                        ? 'var(--pf-t--global--text--color--regular)'
                        : undefined
                    }
                  />
                }
                variant="link"
                onClick={() => setEditing(!editing)}
                className="pf-v6-u-ml-sm"
              ></Button>
            </DescriptionListTerm>
            <DescriptionListDescription>
              {editing ? (
                <Flex
                  direction={{ default: 'column', md: 'row' }}
                  spaceItems={{ default: 'spaceItemsXs' }}
                  alignItems={{ default: 'alignItemsStretch' }}
                >
                  <FlexItem>
                    <FormGroup fieldId="remediation-name">
                      <TextInput
                        value={value}
                        type="text"
                        onChange={(_, v) => setValue(v)}
                        aria-label="Rename Input"
                        autoFocus
                        validated={validationState}
                      />
                      {nameStatus === 'duplicate' && (
                        <p className="pf-v6-u-font-size-sm pf-v6-u-danger-color-100">
                          A remediation plan with the same name already exists
                          in your organization. Enter a unique name and try
                          again.
                        </p>
                      )}
                      {nameStatus === 'empty' && (
                        <p className="pf-v6-u-font-size-sm pf-v6-u-danger-color-100">
                          Playbook name cannot be empty.
                        </p>
                      )}
                    </FormGroup>
                  </FlexItem>
                  <FlexItem>
                    <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                      <Button
                        icon={
                          <CheckIcon
                            color={
                              nameStatus !== 'valid'
                                ? 'var(--pf-t--global--icon--color--disabled)'
                                : 'var(--pf-t--global--text--color--link--default)'
                            }
                          />
                        }
                        variant="link"
                        onClick={() => onSubmit(value)}
                        isDisabled={nameStatus !== 'valid'}
                      ></Button>
                      <Button
                        icon={
                          <TimesIcon color="var(--pf-t--global--text--color--subtle)" />
                        }
                        variant="link"
                        onClick={() => setEditing(false)}
                      ></Button>
                    </Flex>
                  </FlexItem>
                </Flex>
              ) : (
                <Content component="p" style={{ wordBreak: 'break-word' }}>
                  {details.name}
                </Content>
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {/* Last Execution Status */}
          <DescriptionListGroup>
            <DescriptionListTerm>Latest execution status</DescriptionListTerm>
            <DescriptionListDescription>
              {isPlaybookRunsLoading ? (
                <Spinner size="md" />
              ) : (
                <Button
                  variant="link"
                  isInline
                  onClick={() => onNavigateToTab(null, 'executionHistory')}
                >
                  {execStatus(remediationPlaybookRuns?.status, formatedDate)}
                </Button>
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {/* Actions */}
          <DescriptionListGroup>
            <DescriptionListTerm>
              Actions
              <Popover
                bodyContent={() => (
                  <>
                    Actions taken to remediate issues on selected systems when
                    the remediation plan is executed.
                  </>
                )}
              >
                <OutlinedQuestionCircleIcon style={{ marginLeft: '5px' }} />
              </Popover>
            </DescriptionListTerm>
            <DescriptionListDescription>
              <Flex
                direction={{ default: 'row' }}
                alignItems={{ default: 'alignItemsCenter' }}
                spaceItems={{ default: 'spaceItemsMd' }}
              >
                <Button
                  variant="link"
                  onClick={() =>
                    onNavigateToTab(null, 'plannedRemediations:actions')
                  }
                  isInline
                >
                  {`${details?.issue_count} action${
                    details?.issue_count !== 1 ? 's' : ''
                  }`}
                </Button>
                {isCheckingResolutions ? (
                  <Skeleton
                    height="1.5rem"
                    width="200px"
                    screenreaderText="Checking for resolution options"
                  />
                ) : (
                  hasResolutionsAvailable && (
                    <Alert
                      isInline
                      isPlain
                      variant="info"
                      title="Resolution options are available."
                    />
                  )
                )}
              </Flex>
            </DescriptionListDescription>
          </DescriptionListGroup>
          {/* Systems */}
          <DescriptionListGroup>
            <DescriptionListTerm>Systems</DescriptionListTerm>
            <DescriptionListDescription>
              <Button
                variant="link"
                onClick={() =>
                  onNavigateToTab(null, 'plannedRemediations:systems')
                }
                isInline
              >
                {pluralize(details?.system_count, 'system')}
              </Button>
            </DescriptionListDescription>
          </DescriptionListGroup>
          {/* Last Modified */}
          <DescriptionListGroup>
            <DescriptionListTerm>Last modified</DescriptionListTerm>
            <DescriptionListDescription>
              {formatDate(details?.updated_at)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {/* Created by */}
          <DescriptionListGroup>
            <DescriptionListTerm>Created</DescriptionListTerm>
            <DescriptionListDescription>
              {formatDate(details?.created_at)}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

DetailsCard.propTypes = {
  details: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    auto_reboot: PropTypes.bool.isRequired,
    archived: PropTypes.bool.isRequired,
    created_by: PropTypes.shape({
      username: PropTypes.string.isRequired,
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
    }).isRequired,
    created_at: PropTypes.string.isRequired,
    updated_by: PropTypes.shape({
      username: PropTypes.string.isRequired,
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
    }).isRequired,
    updated_at: PropTypes.string.isRequired,
    issue_count: PropTypes.number.isRequired,
    system_count: PropTypes.number.isRequired,
  }).isRequired,
  onNavigateToTab: PropTypes.func,
  allRemediations: PropTypes.array,
  updateRemPlan: PropTypes.func,
  refetch: PropTypes.func,
  remediationPlaybookRuns: PropTypes.object,
  refetchAllRemediations: PropTypes.func,
  isPlaybookRunsLoading: PropTypes.bool,
};

export default DetailsCard;
