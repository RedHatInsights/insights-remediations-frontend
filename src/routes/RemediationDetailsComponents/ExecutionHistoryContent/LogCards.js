import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardBody,
  CardTitle,
  Flex,
  FlexItem,
  Tooltip,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  InProgressIcon,
  ExclamationCircleIcon,
  BanIcon,
  QuestionCircleIcon,
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';
import { useFeatureFlag } from '../../../Utilities/Hooks/useFeatureFlag';

const statusIcon = (status) => {
  const map = {
    success: (
      <CheckCircleIcon
        color="var(--pf-t--global--icon--color--status--success--default)"
        data-testid="check-circle-icon"
      />
    ),
    running: (
      <InProgressIcon
        color="var(--pf-v6-global--info-color--100)"
        data-testid="in-progress-icon"
      />
    ),
    failure: (
      <ExclamationCircleIcon
        color="var(--pf-t--global--icon--color--status--danger--default)"
        data-testid="exclamation-circle-icon"
      />
    ),
    canceled: (
      <BanIcon
        color="var(--pf-t--global--icon--color--status--danger--default)"
        data-testid="ban-icon"
      />
    ),
  };
  return map[status] ?? <QuestionCircleIcon />;
};

const cardStyle = {
  flex: '1 1 0',
};
const LogCards = ({ systemName, status, connectionType, executedBy }) => {
  const isLightspeedRebrandEnabled = useFeatureFlag(
    'platform.lightspeed-rebrand',
  );

  const connectionTypeTitle = isLightspeedRebrandEnabled
    ? 'Red Hat Lightspeed connection type'
    : 'Insights connection type';

  const connectionTypeTooltipContent = isLightspeedRebrandEnabled
    ? 'Red Hat Enterprise Linux systems are connected to Red Hat Lightspeed directly via RHC, or through Satellite via Cloud Connector.'
    : 'Red Hat Enterprise Linux systems are connected to Insights directly via RHC, or through Satellite via Cloud Connector.';

  const connectionTypeAriaLabel = isLightspeedRebrandEnabled
    ? 'Red Hat Lightspeed connection type info'
    : 'Insights connection type info';

  return (
    <Flex
      spaceItems={{ default: 'spaceItemsLg' }}
      alignItems={{ default: 'stretch' }}
      flexWrap={{ default: 'nowrap' }}
      className="pf-v6-u-mb-lg"
      data-testid="flex"
    >
      <FlexItem style={cardStyle} data-testid="flex-item">
        <Card isFullHeight data-testid="card">
          <CardTitle>System</CardTitle>
          <CardBody data-testid="card-body">{systemName ?? '-'}</CardBody>
        </Card>
      </FlexItem>

      <FlexItem style={cardStyle} data-testid="flex-item">
        <Card isFullHeight data-testid="card">
          <CardTitle>System execution status</CardTitle>
          <CardBody data-testid="card-body">
            <Flex
              spaceItems={{ default: 'spaceItemsXs' }}
              alignItems={{ default: 'alignItemsCenter' }}
              data-testid="flex"
            >
              {statusIcon(status)}
              <span>
                {status ? status[0].toUpperCase() + status.slice(1) : '-'}
              </span>
            </Flex>
          </CardBody>
        </Card>
      </FlexItem>

      <FlexItem style={cardStyle} data-testid="flex-item">
        <Card isFullHeight data-testid="card">
          <CardTitle>
            <Flex
              spaceItems={{ default: 'spaceItemsXs' }}
              alignItems={{ default: 'alignItemsCenter' }}
              data-testid="flex"
            >
              <span>
                {connectionTypeTitle}{' '}
                <Tooltip
                  content={connectionTypeTooltipContent}
                  aria-label={connectionTypeAriaLabel}
                  data-testid="tooltip"
                >
                  <OutlinedQuestionCircleIcon />
                </Tooltip>
              </span>
            </Flex>
          </CardTitle>
          <CardBody data-testid="card-body">{connectionType ?? '-'}</CardBody>
        </Card>
      </FlexItem>

      <FlexItem style={cardStyle} data-testid="flex-item">
        <Card isFullHeight data-testid="card">
          <CardTitle>Executed by user</CardTitle>
          <CardBody data-testid="card-body">{executedBy ?? '-'}</CardBody>
        </Card>
      </FlexItem>
    </Flex>
  );
};

LogCards.propTypes = {
  systemName: PropTypes.string,
  status: PropTypes.string,
  connectionType: PropTypes.string,
  executedBy: PropTypes.string,
};

export default LogCards;
