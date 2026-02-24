import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Content,
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';
import { DisconnectedIcon, UnknownIcon } from '@patternfly/react-icons';

const ConnectionStatusModal = ({
  isOpen,
  onClose,
  connection_status,
  executor_type,
}) => {
  const status =
    typeof connection_status === 'string'
      ? connection_status.toLowerCase()
      : connection_status;
  // Convert to lowercase if executor_type is a string, otherwise keep as null/undefined
  const execType =
    typeof executor_type === 'string'
      ? executor_type.toLowerCase()
      : executor_type;

  // Determine modal content based on status and executor type
  let title = '';
  let description = '';
  let body = null;
  let icon = null;

  if (status === 'disconnected') {
    if (execType === 'rhc') {
      title = 'Disconnected';
      description =
        'This system is registered to RHSM, but the system is not configured for use with remediations.';
      body = (
        <>
          Execute <strong>rhc connect</strong> on the system.
        </>
      );
      icon = <DisconnectedIcon />;
    } else if (execType === 'rhc-satellite') {
      title = 'Disconnected';
      description =
        'This system is registered to a satellite, but the satellite is not configured for use with remediations.';
      body = (
        <>
          Ask your satellite administrator to navigate to the satellite&apos;s
          Inventory Upload page and execute the Configure Cloud Connector, Sync
          inventory status, and Restart jobs. In addition, visit{' '}
          <a
            href="https://console.redhat.com/settings/integrations"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: 'underline',
              color: 'var(--pf-t--global--text--color--link--default, #0066cc)',
            }}
          >
            https://console.redhat.com/settings/integrations
          </a>{' '}
          and ensure the satellite is available; if not, execute{' '}
          <strong>systemctl restart rhcd.service</strong> on the satellite.
        </>
      );
      icon = <DisconnectedIcon />;
    } else {
      // Unknown disconnected state
      title = 'Unknown';
      description = 'Connection status is unknown.';
      body = <>Please check the system configuration.</>;
      icon = <UnknownIcon />;
    }
  } else if (
    execType === 'none' ||
    (execType === null && status === 'no_rhc')
  ) {
    title = 'Not configured';
    description =
      'The Remote Host Configuration (rhc) client is not configured for this system. Please apply the fix below that corresponds to your subscription type:';
    body = (
      <>
        <p>
          <strong>Red Hat Subscription Management</strong>
          <br />
          Run <strong>rhc connect</strong> on the system.
        </p>
        <strong>Satellite</strong>
        <p>
          Ask your Satellite administrator to navigate to the Inventory Upload
          page and execute the Configure Cloud Connector, Sync inventory status,
          and Restart jobs. Then, verify the Satellite is available in your
          Integrations settings at{' '}
          <a
            href="https://console.redhat.com/settings/integrations"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: 'underline',
              color: 'var(--pf-t--global--text--color--link--default, #0066cc)',
            }}
          >
            https://console.redhat.com/settings/integrations
          </a>
          . If it is not, run <strong>systemctl restart rhcd.service</strong> on
          the Satellite server.
        </p>
      </>
    );
    icon = <DisconnectedIcon />;
  } else {
    // Unknown state
    title = 'Unknown';
    description = 'Connection status is unknown.';
    body = <>Please check the system configuration.</>;
    icon = <UnknownIcon />;
  }

  return (
    <Modal
      variant={ModalVariant.small}
      isOpen={isOpen}
      onClose={onClose}
      aria-label={`${title} connection status modal`}
    >
      <ModalHeader
        title={
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            {icon && <Icon>{icon}</Icon>}
            <span>{title}</span>
          </Flex>
        }
        labelId="connection-status-modal-title"
      />
      <ModalBody>
        <Content>
          <Content component="p" className="pf-v6-u-mb-md">
            {description}
          </Content>
          <Content component="div">{body}</Content>
        </Content>
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

ConnectionStatusModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  connection_status: PropTypes.string,
  executor_type: PropTypes.string,
};

export default ConnectionStatusModal;
