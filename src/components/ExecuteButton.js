/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';

import PropTypes from 'prop-types';
import { Button, Flex, Spinner, Title, Tooltip } from '@patternfly/react-core';
import { ExecuteModal } from './Modals/ExecuteModal';
import './ExecuteButton.scss';
import './Status.scss';
import { CheckIcon, TimesIcon } from '@patternfly/react-icons';
import { getResolvedSystems } from '../Utilities/utils';

const ExecuteButton = ({
  isLoading,
  isDisabled,
  data,
  getConnectionStatus,
  issueCount,
  runRemediation,
  etag,
  remediationStatus,
  setEtag,
  connectionDetails,
  areDetailsLoading,
  detailsError,
  permissions,
  remediation,
}) => {
  const [open, setOpen] = useState(false);
  const [showRefreshMessage, setShowRefreshMessage] = useState(false);
  const isEnabled = () =>
    true || localStorage.getItem('remediations:fifi:debug') === 'true';

  useEffect(() => {
    if (remediationStatus === 'changed') {
      getConnectionStatus(remediation.id);
      setShowRefreshMessage(true);
    } else if (remediationStatus === 'fulfilled') {
      setOpen(false);
    }
  }, [remediationStatus]);

  const disabledButton = () => {
    return (
      <Tooltip
        minWidth="400px"
        aria-label="details Tooltip"
        content={
          <>
            <Flex
              className="pf-v5-u-ml-md"
              direction={{ default: 'column' }}
              spaceItems={{ default: 'spaceItemsNone' }}
              alignItems={{ default: 'alignItemsFlexStart' }}
            >
              <Title headingLevel="h6" className="pf-v5-u-mb-md">
                Remediations Readiness Check
              </Title>

              <span className="pf-v5-u-font-size-sm">
                {connectionDetails?.system_count === 4 ? (
                  <CheckIcon className="pf-v5-u-mr-sm" />
                ) : (
                  <TimesIcon className="pf-v5-u-mr-sm" />
                )}
                Connected Systems (
                {`${
                  getResolvedSystems(remediation.issues[0]) +
                  '/' +
                  remediation.issues[0].systems.length
                }`}
                ). See systems tab.
              </span>

              <span className="pf-v5-u-font-size-sm">
                {detailsError === 403 ? (
                  <TimesIcon className="pf-v5-u-mr-sm" />
                ) : (
                  <CheckIcon className="pf-v5-u-mr-sm" />
                )}
                <a
                  href="https://console.redhat.com/insights/connector"
                  style={{ textDecoration: 'underline', color: 'white' }}
                  className="pf-v5-u-mr-xs"
                >
                  RHC manager
                </a>
                is {detailsError === 403 ? 'disabled' : 'enabled'}.
              </span>

              <span className="pf-v5-u-font-size-sm pf-v5-u-mb-sm">
                {permissions ? (
                  <CheckIcon className="pf-v5-u-mr-sm" />
                ) : (
                  <TimesIcon className="pf-v5-u-mr-sm" />
                )}
                <a
                  href="https://console.redhat.com/iam/user-access/overview"
                  style={{ textDecoration: 'underline', color: 'white' }}
                  className="pf-v5-u-mr-xs"
                >
                  User access permissions
                </a>
                are {permissions ? '' : 'not'} granted.
              </span>
            </Flex>
          </>
        }
      >
        <Button isAriaDisabled>Execute playbook</Button>
      </Tooltip>
    );
  };

  const buttonWithTooltip = () => {
    return isDisabled ? (
      disabledButton()
    ) : (
      <Button
        data-testid="execute-button-enabled"
        onClick={() => {
          setOpen(true);
          getConnectionStatus(remediation.id);
        }}
      >
        Execute playbook
      </Button>
    );
  };

  return isEnabled() && !areDetailsLoading ? (
    <React.Fragment>
      {buttonWithTooltip()}
      {open && (
        <ExecuteModal
          isOpen={open}
          onClose={() => {
            setShowRefreshMessage(false);
            setOpen(false);
          }}
          showRefresh={showRefreshMessage}
          remediationId={remediation.id}
          remediationName={remediation.name}
          data={data}
          etag={etag}
          isLoading={isLoading}
          issueCount={issueCount}
          runRemediation={runRemediation}
          setEtag={setEtag}
        />
      )}
    </React.Fragment>
  ) : areDetailsLoading ? (
    <Spinner size="lg" />
  ) : null;
};

ExecuteButton.propTypes = {
  isLoading: PropTypes.bool,
  data: PropTypes.array,
  getConnectionStatus: PropTypes.func,
  runRemediation: PropTypes.func,
  remediation: PropTypes.string,
  remediationStatus: PropTypes.string,
  issueCount: PropTypes.number,
  etag: PropTypes.string,
  setEtag: PropTypes.func,
  isDisabled: PropTypes.bool,
  disabledStateText: PropTypes.string,
  connectionDetails: PropTypes.object,
  areDetailsLoading: PropTypes.bool,
  detailsError: PropTypes.any,
  permissions: PropTypes.bool,
};

ExecuteButton.defaultProps = {
  data: [],
  isDisabled: false,
};

export default ExecuteButton;
