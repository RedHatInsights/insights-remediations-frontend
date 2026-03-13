import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ConnectedIcon,
  DisconnectedIcon,
  UnknownIcon,
} from '@patternfly/react-icons';
import { Button, Flex, Tooltip } from '@patternfly/react-core';
import { useFeatureFlag } from '../../Utilities/Hooks/useFeatureFlag';
import ConnectionStatusModal from './ConnectionStatusModal';

const ConnectionStatusColumn = ({ connection_status, executor_type }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isLightspeedRebrandEnabled = useFeatureFlag(
    'platform.lightspeed-rebrand',
  );
  let status = connection_status;
  let execType = executor_type;
  // Convert to lowercase if connection_status is a string
  if (typeof connection_status === 'string') {
    status = connection_status.toLowerCase();
  }
  // Convert to lowercase if executor_type is a string, otherwise keep as null/undefined
  if (typeof executor_type === 'string') {
    execType = executor_type.toLowerCase();
  }

  // Determine if we should show a clickable link (for disconnected, not configured, or unknown)
  const isNotConfigured =
    execType === 'none' || (executor_type === null && status === 'no_rhc');
  const shouldShowLink =
    status === 'disconnected' || status === 'unknown' || isNotConfigured;

  const handleLinkClick = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  // Render connected status with tooltip based on executor_type
  if (status === 'connected') {
    let tooltipContent = '';
    if (execType === 'rhc') {
      tooltipContent =
        'This system is registered to RHSM, and the system is configured for use with remediations.';
    } else if (execType === 'rhc-satellite') {
      tooltipContent =
        'This system is registered to a satellite, and the satellite is configured for use with remediations.';
    }

    const connectedContent = (
      <span>
        <ConnectedIcon className="pf-v6-u-mr-xs" /> Connected
      </span>
    );

    // Only show tooltip if we have content for it
    if (tooltipContent) {
      return (
        <Tooltip content={tooltipContent} position="top">
          {connectedContent}
        </Tooltip>
      );
    }

    return connectedContent;
  }

  // Render statuses that need modals (disconnected, not configured, unknown)
  let displayText = '';
  let icon = null;
  let tooltipContent = '';
  let tooltipPosition = 'left';

  if (isNotConfigured) {
    displayText = 'Not configured';
    icon = <DisconnectedIcon className="pf-v6-u-mr-xs" />;
    tooltipContent = 'There are no connections configured for this system.';
  } else if (status === 'disconnected') {
    if (execType === 'rhc') {
      displayText = 'Disconnected';
      icon = <DisconnectedIcon className="pf-v6-u-mr-xs" />;
      tooltipContent =
        'The Remote Host Configuration (RHC) client is not configured for one or more systems in this plan.';
    } else if (execType === 'rhc-satellite') {
      displayText = 'Disconnected';
      icon = <DisconnectedIcon className="pf-v6-u-mr-xs" />;
      tooltipContent = `The Red Hat Satellite instance that this system is registered to is disconnected from ${isLightspeedRebrandEnabled ? 'Red Hat Lightspeed' : 'Red Hat Insights'}.`;
    } else {
      // Unknown executor type for disconnected status
      displayText = 'Unknown';
      icon = <UnknownIcon className="pf-v6-u-mr-xs" />;
      tooltipContent = 'Connection Status Unknown';
      tooltipPosition = undefined;
    }
  } else {
    displayText = 'Unknown';
    icon = <UnknownIcon className="pf-v6-u-mr-xs" />;
    tooltipContent = 'Connection Status Unknown';
    tooltipPosition = undefined;
  }

  const content = (
    <Flex spaceItems={{ default: 'spaceItemsXs' }}>
      {icon}
      {shouldShowLink ? (
        <Button
          variant="link"
          isInline
          onClick={handleLinkClick}
          style={{ padding: 0, fontSize: 'inherit', fontWeight: 'inherit' }}
        >
          <span style={{ maxWidth: 'fit-content', margin: 0 }}>
            {displayText}
          </span>
        </Button>
      ) : (
        <span style={{ maxWidth: 'fit-content', margin: 0 }}>
          {displayText}
        </span>
      )}
    </Flex>
  );

  return (
    <>
      {tooltipContent ? (
        <Tooltip
          content={tooltipContent}
          {...(tooltipPosition && { position: tooltipPosition })}
        >
          {content}
        </Tooltip>
      ) : (
        content
      )}
      {isModalOpen && (
        <ConnectionStatusModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          connection_status={connection_status}
          executor_type={executor_type}
        />
      )}
    </>
  );
};
ConnectionStatusColumn.propTypes = {
  connection_status: PropTypes.string,
  executor_type: PropTypes.string,
};

export default ConnectionStatusColumn;
