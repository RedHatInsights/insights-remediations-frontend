import React from 'react';
import PropTypes from 'prop-types';
import { Fragment } from 'react';
import {
  ConnectedIcon,
  DisconnectedIcon,
  TimesIcon,
} from '@patternfly/react-icons';
import { Flex, Popover, Title } from '@patternfly/react-core';

const ConnectionStatusColumn = ({ connection_status, executor_type }) => {
  console.log(connection_status, 'status here + ', executor_type, 'execture');
  return (
    <Fragment>
      {connection_status === 'connected' && (
        <span>
          <ConnectedIcon className="pf-u-mr-xs" /> Connected
        </span>
      )}
      {connection_status === 'disconnected' && executor_type === 'RHC' && (
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
                <TimesIcon className="pf-v5-u-mr-sm" />
                RHC is disconnected
              </span>
              <a style={{ textDecoration: 'underline' }}>
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
      )}
      {connection_status !== 'disconnected' &&
        executor_type === 'RHC-satellite' && (
          <Popover
            triggerAction="hover"
            headerContent={
              <Title headingLevel="h4">
                <DisconnectedIcon className="pf-u-mr-xs" />
                <TimesIcon className="pf-v5-u-mr-sm" /> System is disconnected
              </Title>
            }
            position="left"
            bodyContent={
              <Flex
                direction={{ default: 'column' }}
                spaceItems={{ default: 'spaceItemsNone' }}
              >
                <span>
                  <TimesIcon className="pf-v5-u-mr-sm" /> Satellite is
                  disconnected
                </span>
                <a style={{ textDecoration: 'underline' }}>
                  Please review this documentation
                </a>
              </Flex>
            }
          >
            <Flex>
              <DisconnectedIcon className="pf-u-mr-xs" />
              <p
                style={{ borderBottomStyle: 'dotted', maxWidth: 'fit-content' }}
              >
                Disconnected
              </p>
            </Flex>
          </Popover>
        )}
      {connection_status === 'no_rhc' && (
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
                <TimesIcon className="pf-v5-u-mr-sm" />
                RHC is disconnected
              </span>
              <a style={{ textDecoration: 'underline' }}>
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
      )}
    </Fragment>
  );
};

ConnectionStatusColumn.propTypes = {
  connection_status: PropTypes.string,
  executor_type: PropTypes.string,
};

export default ConnectionStatusColumn;
