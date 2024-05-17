/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import PropTypes from 'prop-types';
import {
  ConnectedIcon,
  DisconnectedIcon,
  TimesIcon,
  UnknownIcon,
} from '@patternfly/react-icons';
import { Flex, Popover, Title } from '@patternfly/react-core';

const ConnectionStatusColumn = ({ connection_status, executor_type }) => {
  let status = connection_status;
  let execType = executor_type;
  // Convert to lowercase if connection_status is a string
  if (typeof connection_status === 'string') {
    status = connection_status.toLowerCase();
  }
  if (typeof executor_type === 'string') {
    execType = executor_type.toLowerCase();
  }

  if (status === 403) {
    return (
      <Popover
        triggerAction="hover"
        headerContent={
          <Title headingLevel="h4">
            <UnknownIcon className="pf-u-mr-xs" />
            Connection status unknown
          </Title>
        }
        position="left"
        bodyContent={
          <Flex
            direction={{ default: 'column' }}
            spaceItems={{ default: 'spaceItemsNone' }}
          >
            <span>
              <UnknownIcon className="pf-u-mr-xs" />
              To view connection status, contact your administrator to request
              the remediations:remediation:execute permission within RBAC, and
              the "Allow Insights users to use 'Remediations' to send Ansible
              Playbooks to fix issues on your systems" permission within Remote
              Host Configuration Manager.
              <a
                href="https://access.redhat.com/documentation/en-us/red_hat_insights/1-latest/html/red_hat_insights_remediations_guide/host-communication-with-insights_red-hat-insights-remediation-guide"
                style={{ textDecoration: 'underline' }}
                className="pf-u-ml-xs"
              >
                Remote Host Configuration Manager.
              </a>
            </span>
          </Flex>
        }
      >
        <Flex>
          <UnknownIcon className="pf-u-mr-xs" />
          <p style={{ borderBottomStyle: 'dotted', maxWidth: 'fit-content' }}>
            Unknown
          </p>
        </Flex>
      </Popover>
    );
  } else if (status === 'connected') {
    return (
      <span>
        <ConnectedIcon className="pf-u-mr-xs" /> Connected
      </span>
    );
  } else if (execType === 'none') {
    return (
      <Popover
        triggerAction="hover"
        headerContent={
          <Title headingLevel="h4">
            <DisconnectedIcon className="pf-u-mr-xs" />
            Connection not configured
          </Title>
        }
        position="left"
        bodyContent={
          <Flex
            direction={{ default: 'column' }}
            spaceItems={{ default: 'spaceItemsNone' }}
          >
            <span>
              <TimesIcon className="pf-u-mr-xs" />
              Connect your system or the Red Hat Satellite instance to which
              your system is registered to Red Hat Insights.
            </span>
            <a
              href="https://access.redhat.com/documentation/en-us/red_hat_insights/1-latest/html/red_hat_insights_remediations_guide/host-communication-with-insights_red-hat-insights-remediation-guide"
              style={{ textDecoration: 'underline' }}
            >
              Please review this documentation
            </a>
          </Flex>
        }
      >
        <Flex>
          <DisconnectedIcon className="pf-u-mr-xs" />
          <p style={{ borderBottomStyle: 'dotted', maxWidth: 'fit-content' }}>
            Not configured
          </p>
        </Flex>
      </Popover>
    );
  } else if (status === 'disconnected') {
    if (executor_type === 'rhc') {
      return (
        <Popover
          triggerAction="hover"
          headerContent={
            <Title headingLevel="h4">
              <DisconnectedIcon className="pf-u-mr-xs" />
              System is disconnected
            </Title>
          }
          position="left"
          bodyContent={
            <Flex
              direction={{ default: 'column' }}
              spaceItems={{ default: 'spaceItemsNone' }}
            >
              <span>
                <TimesIcon className="pf-u-mr-xs" />
                Red Hat Insights has been disconnected from this system
              </span>
              <a
                href="https://access.redhat.com/documentation/en-us/red_hat_insights/1-latest/html/red_hat_insights_remediations_guide/host-communication-with-insights_red-hat-insights-remediation-guide"
                style={{ textDecoration: 'underline' }}
              >
                Please review this documentation
              </a>
            </Flex>
          }
        >
          <Flex>
            <DisconnectedIcon className="pf-u-mr-xs" />
            <p style={{ borderBottomStyle: 'dotted', maxWidth: 'fit-content' }}>
              Disconnected
            </p>
          </Flex>
        </Popover>
      );
    } else if (executor_type === 'rhc-satellite') {
      return (
        <Popover
          triggerAction="hover"
          headerContent={
            <Title headingLevel="h4">
              <DisconnectedIcon className="pf-u-mr-xs" />
              System is disconnected
            </Title>
          }
          position="left"
          bodyContent={
            <Flex
              direction={{ default: 'column' }}
              spaceItems={{ default: 'spaceItemsNone' }}
            >
              <span>
                <TimesIcon className="pf-u-mr-xs" /> Red Hat Insights has been
                disconnected from the Red Hat Satellite instance that this
                system is registered to.
              </span>
              <a
                href="https://access.redhat.com/documentation/en-us/red_hat_insights/1-latest/html/red_hat_insights_remediations_guide/host-communication-with-insights_red-hat-insights-remediation-guide"
                style={{ textDecoration: 'underline' }}
              >
                Please review this documentation
              </a>
            </Flex>
          }
        >
          <Flex>
            <DisconnectedIcon className="pf-u-mr-xs" />
            <p style={{ borderBottomStyle: 'dotted', maxWidth: 'fit-content' }}>
              Disconnected
            </p>
          </Flex>
        </Popover>
      );
    }
  }
};

ConnectionStatusColumn.propTypes = {
  connection_status: PropTypes.string,
  executor_type: PropTypes.string,
};

export default ConnectionStatusColumn;
