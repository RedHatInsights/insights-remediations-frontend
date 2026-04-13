import React, { useContext, useEffect, useMemo, useState } from 'react';

import propTypes from 'prop-types';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { AccessCheck } from '@project-kessel/react-kessel-access-check';
import validate from './RemediationsModal/validate';

import { Button, Tooltip } from '@patternfly/react-core';
import RemediationWizard from '../components/RemediationWizard/RemediationWizard';
import NoDataModal from './RemediationsModal/NoDataModal';
import { getTooltipContent } from '../Utilities/helpers';
import { useFeatureFlag } from '../Utilities/Hooks/useFeatureFlag';
import { useKesselRemediationPermissionState } from '../Utilities/Hooks/useKesselRemediationPermissionState';
import { PermissionContext } from '../App';
import { getChromePerms } from '../Utilities/remediationsPermissions';
import { KESSEL_API_BASE_URL } from '../constants';

const RemediationButtonContent = ({
  isDisabled = false,
  children = 'Remediate with Ansible',
  dataProvider,
  onRemediationCreated = (f) => f,
  buttonProps,
  patchNoAdvisoryText,
  hasSelected,
  hasPermissions,
  isCompliancePrecedenceEnabled,
  buttonTooltipContent,
}) => {
  const [remediationsData, setRemediationsData] = useState();
  const [isNoDataModalOpen, setNoDataModalOpen] = useState(false);

  const tooltipContent = useMemo(() => {
    const base = getTooltipContent(hasPermissions, hasSelected);
    if (base != null) {
      return base;
    }
    if (buttonTooltipContent != null && buttonTooltipContent !== '') {
      return buttonTooltipContent;
    }
    return null;
  }, [hasSelected, hasPermissions, buttonTooltipContent]);

  const isInteractionBlocked = !hasPermissions || !hasSelected;
  const isButtonDisabled = isInteractionBlocked || isDisabled;

  const button = (
    <Button
      isDisabled={isButtonDisabled}
      {...buttonProps}
      data-testid={
        isInteractionBlocked
          ? 'remediationButton-no-permissions-or-selected'
          : 'remediationButton-with-permissions-and-selected'
      }
      onClick={
        isInteractionBlocked
          ? undefined
          : () => {
              Promise.resolve(dataProvider()).then((data) => {
                if (!data) {
                  setNoDataModalOpen(true);
                  return;
                }

                try {
                  validate(data);
                  setRemediationsData(data);
                } catch {
                  setNoDataModalOpen(true);
                }
              });
            }
      }
    >
      {children}
    </Button>
  );

  return (
    <React.Fragment>
      {tooltipContent != null ? (
        <Tooltip content={tooltipContent}>
          <span>{button}</span>
        </Tooltip>
      ) : (
        button
      )}

      <NoDataModal
        isOpen={isNoDataModalOpen}
        setOpen={setNoDataModalOpen}
        patchNoAdvisoryText={patchNoAdvisoryText}
      />
      {remediationsData && (
        <RemediationWizard
          setOpen={(isOpen) =>
            setRemediationsData((prevData) =>
              isOpen === false ? null : prevData,
            )
          }
          data={{
            onRemediationCreated,
            ...(remediationsData || {}),
          }}
          isCompliancePrecedenceEnabled={isCompliancePrecedenceEnabled}
        />
      )}
    </React.Fragment>
  );
};

RemediationButtonContent.propTypes = {
  isDisabled: propTypes.bool,
  dataProvider: propTypes.func.isRequired,
  onRemediationCreated: propTypes.func,
  children: propTypes.node,
  buttonProps: propTypes.shape({
    [propTypes.string]: propTypes.any,
  }),
  patchNoAdvisoryText: propTypes.string,
  hasSelected: propTypes.bool.isRequired,
  hasPermissions: propTypes.bool.isRequired,
  isCompliancePrecedenceEnabled: propTypes.bool,
  buttonTooltipContent: propTypes.string,
};

const RemediationButtonRbacFallback = (props) => {
  const [chromeWritePermission, setChromeWritePermission] = useState(false);
  const chrome = useChrome();
  const isCompliancePrecedenceEnabled = useFeatureFlag(
    'remediations.precedence',
  );

  useEffect(() => {
    if (!chrome || typeof chrome.getUserPermissions !== 'function') {
      return;
    }

    let cancelled = false;

    chrome
      .getUserPermissions('remediations')
      .then((list) => {
        if (cancelled) return;
        const flags = getChromePerms(list);
        setChromeWritePermission(flags.write);
      })
      .catch((error) => {
        console.error('Error loading user permissions:', error);
        if (!cancelled) {
          setChromeWritePermission(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chrome]);

  return (
    <RemediationButtonContent
      {...props}
      hasPermissions={chromeWritePermission}
      isCompliancePrecedenceEnabled={isCompliancePrecedenceEnabled}
    />
  );
};

const RemediationButtonKesselFallback = ({ baseUrl, ...props }) => {
  const { permissions, isLoading } =
    useKesselRemediationPermissionState(baseUrl);
  const isCompliancePrecedenceEnabled = useFeatureFlag(
    'remediations.precedence',
  );

  const effectivePermissions = isLoading
    ? { read: false, write: false, execute: false }
    : permissions;

  return (
    <RemediationButtonContent
      {...props}
      hasPermissions={effectivePermissions.write}
      isCompliancePrecedenceEnabled={isCompliancePrecedenceEnabled}
    />
  );
};

RemediationButtonKesselFallback.propTypes = {
  baseUrl: propTypes.string.isRequired,
};

const RemediationButton = (props) => {
  const permissionCtx = useContext(PermissionContext);
  const isKesselEnabled = useFeatureFlag('kessel-for-remediations');
  const isCompliancePrecedenceEnabled = useFeatureFlag(
    'remediations.precedence',
  );
  const baseUrl = window.location.origin || 'https://console.redhat.com';

  if (permissionCtx) {
    return (
      <RemediationButtonContent
        {...props}
        hasPermissions={permissionCtx.permissions.write}
        isCompliancePrecedenceEnabled={isCompliancePrecedenceEnabled}
      />
    );
  }

  if (isKesselEnabled) {
    return (
      <AccessCheck.Provider baseUrl={baseUrl} apiPath={KESSEL_API_BASE_URL}>
        <RemediationButtonKesselFallback baseUrl={baseUrl} {...props} />
      </AccessCheck.Provider>
    );
  }

  return <RemediationButtonRbacFallback {...props} />;
};

RemediationButton.propTypes = {
  isDisabled: propTypes.bool,
  dataProvider: propTypes.func.isRequired,
  onRemediationCreated: propTypes.func,
  children: propTypes.node,
  buttonProps: propTypes.shape({
    [propTypes.string]: propTypes.any,
  }),
  patchNoAdvisoryText: propTypes.string,
  hasSelected: propTypes.bool.isRequired,
  buttonTooltipContent: propTypes.string,
};

export default RemediationButton;
