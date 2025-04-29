import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
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
} from '@patternfly/react-icons';

const statusIcon = (status) => {
  const map = {
    success: (
      <CheckCircleIcon color="var(--pf-v5-global--success-color--100)" />
    ),
    running: <InProgressIcon color="var(--pf-v5-global--info-color--100)" />,
    failure: (
      <ExclamationCircleIcon color="var(--pf-v5-global--danger-color--100)" />
    ),
    canceled: <BanIcon color="var(--pf-v5-global--danger-color--100)" />,
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
    className="pf-v5-u-mb-lg"
  >
    <FlexItem style={cardStyle}>
      <Card isFullHeight>
        <CardTitle>System</CardTitle>
        <CardBody>{systemName ?? '-'}</CardBody>
      </Card>
    </FlexItem>

    <FlexItem style={cardStyle}>
      <Card isFullHeight>
        <CardTitle>System execution status</CardTitle>
        <CardBody>
          <Flex
            spaceItems={{ default: 'spaceItemsXs' }}
            alignItems={{ default: 'alignItemsCenter' }}
          >
            {statusIcon(status)}
            <span>
              {status ? status[0].toUpperCase() + status.slice(1) : '-'}
            </span>
          </Flex>
        </CardBody>
      </Card>
    </FlexItem>

    <FlexItem style={cardStyle}>
      <Card isFullHeight>
        <CardTitle>
          <Flex
            spaceItems={{ default: 'spaceItemsXs' }}
            alignItems={{ default: 'alignItemsCenter' }}
          >
            <span>Insights connection type</span>
            <Tooltip
              content="Red Hat Enterprise Linux systems are connected to Insights directly via RHC, or through Satellite via Cloud Connector."
              aria-label="Insights connection type info"
            >
              <Button
                variant="plain"
                aria-label="More info"
                style={{ padding: '0' }}
              >
                <QuestionCircleIcon color="var(--pf-v5-global--info-color--100)" />
              </Button>
            </Tooltip>
          </Flex>
        </CardTitle>
        <CardBody>{connectionType ?? '-'}</CardBody>
      </Card>
    </FlexItem>

    <FlexItem style={cardStyle}>
      <Card isFullHeight>
        <CardTitle>Executed by user</CardTitle>
        <CardBody>{executedBy ?? '-'}</CardBody>
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
