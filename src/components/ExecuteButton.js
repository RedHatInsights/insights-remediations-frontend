/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';

import PropTypes from 'prop-types';
import { Button, Flex, Spinner, Title, Tooltip } from '@patternfly/react-core';
import { ExecuteModal } from './Modals/ExecuteModal';
import './ExecuteButton.scss';
import './Status.scss';
import {
  CheckIcon,
  TimesIcon,
  WarningTriangleIcon,
} from '@patternfly/react-icons';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import { Link } from 'react-router-dom';

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
  areDetailsLoading,
  detailsError,
  permissions,
  remediation,
  connectedSystems,
  totalSystems,
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

  const buttonWithTooltip = () => {
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
                {connectedSystems === 0 ? (
                  <TimesIcon className="pf-v5-u-mr-sm" />
                ) : (
                  <CheckIcon className="pf-v5-u-mr-sm" />
                )}
                Connected Systems ({`${connectedSystems + '/' + totalSystems}`}
                ). See systems tab.
              </span>

              <span className="pf-v5-u-font-size-sm">
                {detailsError === 403 ? (
                  <TimesIcon className="pf-v5-u-mr-sm" />
                ) : (
                  <CheckIcon className="pf-v5-u-mr-sm" />
                )}
                <InsightsLink
                  app="connector"
                  to="/"
                  style={{ textDecoration: 'underline', color: 'white' }}
                  className="pf-v5-u-mr-xs"
                >
                  RHC manager
                </InsightsLink>
                is {detailsError === 403 ? 'disabled' : 'enabled'}.
              </span>

              <span className="pf-v5-u-font-size-sm pf-v5-u-mb-sm">
                {permissions ? (
                  <CheckIcon className="pf-v5-u-mr-sm" />
                ) : (
                  <TimesIcon className="pf-v5-u-mr-sm" />
                )}
                <Link
                  to="/iam/user-access/overview"
                  style={{ textDecoration: 'underline', color: 'white' }}
                  className="pf-v5-u-mr-xs"
                >
                  User access permissions
                </Link>
                are {permissions ? '' : 'not'} granted.
              </span>
            </Flex>
          </>
        }
      >
        <Button
          isAriaDisabled={isDisabled}
          data-testid="execute-button-enabled"
          onClick={() => {
            setOpen(true);
            getConnectionStatus(remediation.id);
          }}
        >
          {isDisabled && <WarningTriangleIcon />} Execute
        </Button>
      </Tooltip>
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
  connectedSystems: PropTypes.number,
  areDetailsLoading: PropTypes.bool,
  detailsError: PropTypes.any,
  permissions: PropTypes.bool,
  totalSystems: PropTypes.number,
};

ExecuteButton.defaultProps = {
  data: [],
  isDisabled: false,
};

export default ExecuteButton;
