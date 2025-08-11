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
        color="var(--pf-v6-global--danger-color--100)"
        data-testid="exclamation-circle-icon"
      />
    ),
    canceled: (
      <BanIcon
        color="var(--pf-v6-global--danger-color--100)"
        data-testid="ban-icon"
      />
    ),
  };
  return map[status] ?? <QuestionCircleIcon />;
};

const cardStyle = {
  flex: '1 1 0',
};
const LogCards = ({ systemName, status, connectionType, executedBy }) => (
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
              Insights connection type{' '}
              <Tooltip
                content="Red Hat Enterprise Linux systems are connected to Insights directly via RHC, or through Satellite via Cloud Connector."
                aria-label="Insights connection type info"
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

LogCards.propTypes = {
  systemName: PropTypes.string,
  status: PropTypes.string,
  connectionType: PropTypes.string,
  executedBy: PropTypes.string,
};

export default LogCards;
