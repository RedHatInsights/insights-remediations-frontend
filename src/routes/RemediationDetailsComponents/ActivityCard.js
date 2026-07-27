import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardExpandableContent,
  CardHeader,
  CardTitle,
  Flex,
  Title,
  Label,
  Popover,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  CardBody,
  Spinner,
  Button,
  Icon,
  Timestamp,
} from '@patternfly/react-core';
import { formatDate } from '../Cells';
import {
  execStatus,
  getExpandableCardToggleProps,
  toValidDate,
} from './helpers';
import useRemediations from '../../Utilities/Hooks/api/useRemediations';
import { getOrgConfig } from '../api';
import { capitalize } from '../../Utilities/utils';
import { formatDuration } from '../../Utilities/retentionPolicy';
import {
  AngleDownIcon,
  AngleUpIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';
import { getExpirationState } from '../helpers';

const ACTIVITY_CARD_OUIA_ID = 'activity-card';
const ACTIVITY_CARD_TITLE_ID = 'activity-card-title';
const ACTIVITY_CARD_TOGGLE_ID = 'activity-card-toggle';
const ACTIVITY_CARD_CONTENT_ID = 'activity-card-content';

const getActivityExpirationDisplay = (expiration) => {
  if (expiration.status === 'unknown') {
    return {
      key: 'unknown',
      label: 'Expiration date unknown',
      labelStatus: 'danger',
      text: 'Expiration date unknown',
      icon: 'danger',
      hasTooltip: false,
    };
  }

  if (expiration.status === 'expired') {
    return {
      key: 'expired',
      label: 'Expired',
      labelStatus: 'warning',
      text: 'Expired',
      icon: 'warning',
      hasTooltip: true,
    };
  }

  const remainingText = capitalize(`${expiration.durationText} remaining`);

  if (expiration.status === 'warning') {
    return {
      key: 'warning',
      label: `Expires in ${expiration.durationText}`,
      labelStatus: 'warning',
      text: remainingText,
      icon: 'warning',
      hasTooltip: true,
    };
  }

  return {
    key: 'normal',
    label: null,
    labelStatus: null,
    text: remainingText,
    icon: null,
    hasTooltip: true,
  };
};

const ActivityCard = ({
  details,
  onNavigateToTab,
  lastRemediationPlaybookRun,
  isPlaybookRunsLoading,
  retentionPolicyRefreshNonce = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  // Get organization configuration
  const {
    result: orgConfig,
    error: orgConfigError,
    refetch: refetchOrgConfig,
  } = useRemediations(getOrgConfig);

  useEffect(() => {
    if (retentionPolicyRefreshNonce > 0 && refetchOrgConfig) {
      refetchOrgConfig();
    }
  }, [retentionPolicyRefreshNonce, refetchOrgConfig]);

  // Transform timestamp fields into dates
  // If the timestamp is invalid, set to null
  const updatedAtDate = toValidDate(lastRemediationPlaybookRun?.updated_at);
  const warningDays = orgConfig?.plan_warning_days;
  const expirationState = getExpirationState({
    expiresAt: details?.expires_at,
    warningDays,
    isWarningWindowEnabled: !orgConfigError && warningDays > 0,
  });
  const expirationDisplay = getActivityExpirationDisplay(expirationState);

  // Build the retention period text from effective config
  const retentionDays = orgConfig?.plan_retention_days;
  const retentionDurationText =
    retentionDays != null ? formatDuration(retentionDays) : 'an unknown period';

  return (
    <Card
      data-ouia-component-id={ACTIVITY_CARD_OUIA_ID}
      isExpanded={isExpanded}
    >
      <CardHeader>
        <CardTitle id={ACTIVITY_CARD_TITLE_ID} style={{ width: '100%' }}>
          <Flex
            justifyContent={{ default: 'justifyContentSpaceBetween' }}
            alignItems={{ default: 'alignItemsCenter' }}
          >
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              spaceItems={{ default: 'spaceItemsSm' }}
            >
              <Button
                variant="plain"
                icon={isExpanded ? <AngleUpIcon /> : <AngleDownIcon />}
                onClick={() => setIsExpanded((current) => !current)}
                {...getExpandableCardToggleProps(
                  ACTIVITY_CARD_TOGGLE_ID,
                  ACTIVITY_CARD_CONTENT_ID,
                  isExpanded,
                  'Toggle activity card',
                )}
              />
              <Title headingLevel="h4" size="xl">
                Activity
              </Title>
            </Flex>
            {expirationDisplay.label && (
              <Label status={expirationDisplay.labelStatus} variant="outline">
                {expirationDisplay.label}
              </Label>
            )}
          </Flex>
        </CardTitle>
      </CardHeader>
      <CardExpandableContent
        id={ACTIVITY_CARD_CONTENT_ID}
        data-ouia-component-id={ACTIVITY_CARD_CONTENT_ID}
      >
        <CardBody>
          <DescriptionList>
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
                    {execStatus(
                      lastRemediationPlaybookRun?.status,
                      updatedAtDate,
                    )}
                  </Button>
                )}
              </DescriptionListDescription>
            </DescriptionListGroup>
            {/* Created */}
            <DescriptionListGroup>
              <DescriptionListTerm>Created</DescriptionListTerm>
              <DescriptionListDescription>
                {formatDate(details?.created_at)}
              </DescriptionListDescription>
            </DescriptionListGroup>
            {/* Expiration */}
            <DescriptionListGroup>
              <DescriptionListTerm>
                <Flex
                  spaceItems={{ default: 'spaceItemsXs' }}
                  alignItems={{ default: 'alignItemsCenter' }}
                >
                  <span>Expiration</span>
                  <Popover
                    aria-label="Retention policy help popover"
                    headerContent="Retention policy"
                    bodyContent={
                      <div>
                        Remediation plans are automatically deleted after{' '}
                        {retentionDurationText} of inactivity. An administrator
                        can change this period for your organization by editing
                        the retention policy.
                      </div>
                    }
                  >
                    <Button
                      variant="plain"
                      icon={<OutlinedQuestionCircleIcon />}
                      aria-label="Retention policy help"
                      hasNoPadding
                    />
                  </Popover>
                </Flex>
              </DescriptionListTerm>
              <DescriptionListDescription>
                <Flex
                  spaceItems={{ default: 'spaceItemsSm' }}
                  alignItems={{ default: 'alignItemsCenter' }}
                >
                  {expirationDisplay.icon === 'danger' ? (
                    <Icon status="danger" data-testid="icon">
                      <ExclamationCircleIcon />
                    </Icon>
                  ) : expirationDisplay.icon === 'warning' ? (
                    <Icon status="warning" data-testid="icon">
                      <ExclamationTriangleIcon />
                    </Icon>
                  ) : null}
                  {expirationDisplay.hasTooltip ? (
                    <Timestamp
                      date={expirationState.expiresAtDate}
                      tooltip={{
                        variant: 'custom',
                        content: formatDate(expirationState.expiresAtDate),
                        tooltipProps: { position: 'top' },
                      }}
                    >
                      {expirationDisplay.text}
                    </Timestamp>
                  ) : (
                    <span>{expirationDisplay.text}</span>
                  )}
                </Flex>
              </DescriptionListDescription>
            </DescriptionListGroup>
            {/* Last Modified */}
            <DescriptionListGroup>
              <DescriptionListTerm>Last modified</DescriptionListTerm>
              <DescriptionListDescription>
                {formatDate(details?.updated_at)}
              </DescriptionListDescription>
            </DescriptionListGroup>
            {/* Last Executed */}
            <DescriptionListGroup>
              <DescriptionListTerm>Last executed</DescriptionListTerm>
              <DescriptionListDescription>
                {isPlaybookRunsLoading ? (
                  <Spinner size="md" />
                ) : updatedAtDate ? (
                  formatDate(updatedAtDate)
                ) : (
                  'Never'
                )}
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </CardBody>
      </CardExpandableContent>
    </Card>
  );
};

ActivityCard.propTypes = {
  details: PropTypes.object.isRequired,
  onNavigateToTab: PropTypes.func.isRequired,
  lastRemediationPlaybookRun: PropTypes.object,
  isPlaybookRunsLoading: PropTypes.bool,
  retentionPolicyRefreshNonce: PropTypes.number,
};

export default ActivityCard;
