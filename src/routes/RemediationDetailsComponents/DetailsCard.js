import React, { useEffect, useState } from 'react';
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
  CardFooter,
  Popover,
  FlexItem,
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

const DetailsCard = ({
  details,
  remediationStatus,
  updateRemPlan,
  onNavigateToTab,
  allRemediations,
  refetch,
  remediationPlaybookRuns,
  refetchAllRemediations,
}) => {
  const isLightspeedRebrandEnabled = useFeatureFlag(
    'platform.lightspeed-rebrand',
  );
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(details?.name);
  const [rebootToggle, setRebootToggle] = useState(details?.auto_reboot);
  const addNotification = useAddNotification();

  useEffect(() => {
    setValue(details?.name || '');
  }, [details?.name]);

  const [isVerifyingName, isDuplicate] = useVerifyName(
    value,
    allRemediations?.data,
  );

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
  const onToggleAutoreboot = () => {
    setRebootToggle(!rebootToggle);
    updateRemPlan({ id: details.id, auto_reboot: !rebootToggle });
  };

  const formatedDate = new Date(remediationPlaybookRuns?.updated_at);
  return (
    <Card isFullHeight>
      <CardTitle>
        <Title headingLevel="h4" size="xl">
          Remediation plan details and status
        </Title>
      </CardTitle>
      <CardBody>
        <DescriptionList
          isHorizontal
          orientation={{
            sm: 'vertical',
            md: 'horizontal',
            lg: 'horizontal',
            xl: 'horizontal',
            '2xl': 'horizontal',
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
          {/* Created by */}
          <DescriptionListGroup>
            <DescriptionListTerm>Created</DescriptionListTerm>
            <DescriptionListDescription>
              {formatDate(details?.created_at)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {/* Last Modified */}
          <DescriptionListGroup>
            <DescriptionListTerm>Last modified</DescriptionListTerm>
            <DescriptionListDescription>
              {formatDate(details?.updated_at)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {/* Last Execution Status */}
          <DescriptionListGroup>
            <DescriptionListTerm>Latest execution status</DescriptionListTerm>
            <DescriptionListDescription>
              <Button
                variant="link"
                isInline
                onClick={() => onNavigateToTab(null, 'executionHistory')}
              >
                {execStatus(remediationPlaybookRuns?.status, formatedDate)}
              </Button>
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
              <Button
                variant="link"
                onClick={() => onNavigateToTab(null, 'actions')}
                isInline
              >
                {`${details?.issues.length} action${
                  details?.issues.length !== 1 ? 's' : ''
                }`}
              </Button>
            </DescriptionListDescription>
          </DescriptionListGroup>
          {/* Systems */}
          <DescriptionListGroup>
            <DescriptionListTerm>Systems</DescriptionListTerm>
            <DescriptionListDescription>
              <Button
                variant="link"
                onClick={() => onNavigateToTab(null, 'systems')}
                isInline
              >
                {`${remediationStatus?.totalSystems} system${
                  remediationStatus?.totalSystems !== 1 ? 's' : ''
                }`}
              </Button>
            </DescriptionListDescription>
          </DescriptionListGroup>
          {/* Autoreboot toggle */}
          <DescriptionListGroup>
            <DescriptionListTerm>Auto-reboot</DescriptionListTerm>
            <DescriptionListDescription>
              <Switch
                id="autoreboot-switch"
                isChecked={rebootToggle}
                onChange={onToggleAutoreboot}
                label="On"
              />
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
      <CardFooter className="pf-v6-u-font-size-sm">
        New to remediating through{' '}
        {isLightspeedRebrandEnabled ? 'Red Hat Lightspeed' : 'Insights'}?{' '}
        <InsightsLink
          to={
            'https://docs.redhat.com/en/documentation/red_hat_insights/1-latest/html-single/red_hat_insights_remediations_guide/index#creating-managing-playbooks_red-hat-insights-remediation-guide'
          }
          target="_blank"
        >
          <Button
            icon={<ExternalLinkAltIcon />}
            variant="link"
            className="pf-v6-u-font-size-sm"
          >
            Learn More
          </Button>{' '}
        </InsightsLink>
      </CardFooter>
    </Card>
  );
};

DetailsCard.propTypes = {
  details: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    needs_reboot: PropTypes.bool.isRequired,
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
    resolved_count: PropTypes.number.isRequired,
    issues: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        resolution: PropTypes.shape({
          id: PropTypes.string.isRequired,
          description: PropTypes.string.isRequired,
          resolution_risk: PropTypes.number.isRequired,
          needs_reboot: PropTypes.bool.isRequired,
        }).isRequired,
        resolutions_available: PropTypes.number.isRequired,
        systems: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string.isRequired,
            hostname: PropTypes.string.isRequired,
            display_name: PropTypes.string.isRequired,
            resolved: PropTypes.bool.isRequired,
          }),
        ).isRequired,
      }),
    ).isRequired,
    autoreboot: PropTypes.bool.isRequired,
  }).isRequired,
  onRename: PropTypes.func.isRequired,
  onToggleAutoreboot: PropTypes.func.isRequired,
  onViewActions: PropTypes.func.isRequired,
  remediationStatus: PropTypes.any,
  onNavigateToTab: PropTypes.func,
  allRemediations: PropTypes.shape({
    data: PropTypes.array,
  }),
  updateRemPlan: PropTypes.func,
  refetch: PropTypes.func,
  remediationPlaybookRuns: PropTypes.object,
  refetchAllRemediations: PropTypes.func,
};

export default DetailsCard;
