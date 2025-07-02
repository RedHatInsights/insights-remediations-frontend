import React, { useEffect, useState } from 'react';

import propTypes from 'prop-types';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import validate from './RemediationsModal/validate';

import { CAN_REMEDIATE, matchPermissions } from '../Utilities/utils';
import { Button, Tooltip } from '@patternfly/react-core';
import RemediationWizard from './RemediationsModal';
import NoDataModal from './RemediationsModal/NoDataModal';

const RemediationButton = ({
  isDisabled,
  children,
  dataProvider,
  onRemediationCreated,
  buttonProps,
  patchNoAdvisoryText,
}) => {
  const [hasPermissions, setHasPermissions] = useState(false);
  const [remediationsData, setRemediationsData] = useState();
  const [isNoDataModalOpen, setNoDataModalOpen] = useState(false);
  const chrome = useChrome();

  useEffect(() => {
    chrome.getUserPermissions('remediations').then((permissions) => {
      setHasPermissions(
        permissions.some(({ permission }) => {
          return matchPermissions(permission, CAN_REMEDIATE);
        }),
      );
    });
  }, []);

  if (!hasPermissions) {
    return (
      <Tooltip content="You do not have correct permissions to remediate this entity.">
        <span>
          <Button
            isDisabled
            {...buttonProps}
            data-testid="remediationButton-no-permissions"
          >
            {children}
          </Button>
        </span>
      </Tooltip>
    );
  }

  return (
    <React.Fragment>
      <Button
        isDisabled={isDisabled}
        data-testid="remediationButton-with-permissions"
        onClick={() => {
          Promise.resolve(dataProvider()).then((data) => {
            if (!data) {
              setNoDataModalOpen(true);
              return;
            }

            validate(data);
            setRemediationsData(data);
          });
        }}
        {...buttonProps}
      >
        {children}
      </Button>
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
        />
      )}
    </React.Fragment>
  );
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
};

RemediationButton.defaultProps = {
  isDisabled: false,
  onRemediationCreated: (f) => f,
  children: 'Remediate with Ansible',
};

export default RemediationButton;
