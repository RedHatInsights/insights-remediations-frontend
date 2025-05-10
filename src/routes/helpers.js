import React from 'react';
import PropTypes from 'prop-types';
import {
  Icon,
  Label,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  InProgressIcon,
  ExclamationCircleIcon,
  BanIcon,
} from '@patternfly/react-icons';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';

const STATUS_META = {
  success: {
    text: 'Succeeded',
    color: 'green',
    Icon: CheckCircleIcon,
  },
  running: {
    text: 'In progress',
    color: 'gold',
    Icon: InProgressIcon,
  },
  failure: {
    text: 'Failed',
    color: 'red',
    Icon: ExclamationCircleIcon,
  },
  canceled: {
    text: 'Canceled',
    color: 'red',
    Icon: BanIcon,
  },
};

export const getStatusMeta = (status = '') =>
  STATUS_META[status.toLowerCase()] ?? null;

export const StatusLabel = ({ status = '' }) => {
  const meta = getStatusMeta(status);
  if (!meta) return null;
  const { color, text, Icon: PFIcon } = meta;

  return (
    <Label color={color} icon={<PFIcon />} isCompact>
      {text}
    </Label>
  );
};

StatusLabel.propTypes = { status: PropTypes.string };

export const StatusIcon = ({ status = '', size = 'sm' }) => {
  const meta = getStatusMeta(status);
  if (!meta) return null;
  const { Icon: PFIcon } = meta;

  return <PFIcon size={size} aria-label={status} />;
};

StatusIcon.propTypes = {
  status: PropTypes.string.isRequired,
  size: PropTypes.string,
};

export const renderConnectionStatus = (status) => {
  const plain = (text) => (
    <Text component={TextVariants.p} className="pf-v5-u-mb-0">
      {text}
    </Text>
  );

  switch (status) {
    case 'connected':
      return (
        <Text component={TextVariants.p}>
          <Icon status="success">
            <StatusIcon status="success" />
          </Icon>{' '}
          Ready
        </Text>
      );

    case 'disconnected':
      return plain('Connection issue ‒ RHC not responding');

    case 'no_executor':
      return (
        <TextContent>
          {plain('Cannot remediate ‒ direct connection')}
          <Text component={TextVariants.small}>
            Connect your systems to Satellite to automatically remediate.
          </Text>
        </TextContent>
      );

    case 'no_source':
      return plain('Cannot remediate ‒ Satellite not configured');

    case 'no_receptor':
      return (
        <TextContent>
          {plain('Cannot remediate ‒ Cloud Connector not defined')}
          <Text component={TextVariants.small}>
            Configure Cloud Connector to automatically remediate.
          </Text>
        </TextContent>
      );

    case 'no_rhc':
      return (
        <TextContent>
          {plain('Cannot remediate ‒ Cloud Connector not defined')}
          <Text component={TextVariants.small}>
            Remediation from Insights requires Cloud Connector. Cloud Connector
            can be enabled via Satellite, or through&nbsp;
            <InsightsLink app="connector" to="/">
              RHC
            </InsightsLink>
          </Text>
        </TextContent>
      );

    case 'loading':
      return plain('Checking …');

    default:
      return plain('Not available');
  }
};
