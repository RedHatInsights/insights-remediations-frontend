import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Label } from '@patternfly/react-core';
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
    status: 'success',
    Icon: CheckCircleIcon,
  },
  running: {
    text: 'In progress',
    color: 'orange',
    status: 'info',
    Icon: InProgressIcon,
  },
  failure: {
    text: 'Failed',
    color: 'red',
    status: 'danger',
    Icon: ExclamationCircleIcon,
  },
  canceled: {
    text: 'Canceled',
    color: 'red',
    Icon: BanIcon,
  },
};

export const getStatusMeta = (status = '') => {
  if (!status || typeof status !== 'string') return null;
  return STATUS_META[status.toLowerCase()] ?? null;
};

export const StatusLabel = ({ status = '' }) => {
  const meta = getStatusMeta(status);
  if (!meta) return null;
  const { color, text, status: pfStatus, Icon: PFIcon } = meta;

  return (
    <Label
      color={color}
      icon={<PFIcon />}
      isCompact
      variant="filled"
      {...(pfStatus && { status: pfStatus })}
    >
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
    <p className="pf-v6-u-mb-0" data-testid="text">
      {text}
    </p>
  );

  switch (status) {
    case 'connected':
      return (
        <p>
          <Icon status="success">
            <StatusIcon status="success" />
          </Icon>{' '}
          Ready
        </p>
      );

    case 'disconnected':
      return plain('Connection issue ‒ RHC not responding');

    case 'no_executor':
      return (
        <div data-testid="text-content">
          {plain('Cannot remediate ‒ direct connection')}
          <small>
            Connect your systems to Satellite to automatically remediate.
          </small>
        </div>
      );

    case 'no_source':
      return plain('Cannot remediate ‒ Satellite not configured');

    case 'no_receptor':
      return (
        <div data-testid="text-content">
          {plain('Cannot remediate ‒ Cloud Connector not defined')}
          <small>Configure Cloud Connector to automatically remediate.</small>
        </div>
      );

    case 'no_rhc':
      return (
        <div data-testid="text-content">
          {plain('Cannot remediate ‒ Cloud Connector not defined')}
          <small>
            Remediation from Insights requires Cloud Connector. Cloud Connector
            can be enabled via Satellite, or through&nbsp;
            <InsightsLink app="connector" to="/">
              RHC
            </InsightsLink>
          </small>
        </div>
      );

    case 'loading':
      return plain('Checking …');

    default:
      return plain('Not available');
  }
};
