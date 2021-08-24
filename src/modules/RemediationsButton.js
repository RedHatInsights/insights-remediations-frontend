import React, { useEffect, useState } from 'react';

import propTypes from 'prop-types';
import validate from './RemediationsModal/validate';

import { CAN_REMEDIATE } from '../Utilities/utils';
import { Button, Tooltip } from '@patternfly/react-core';
import RemediationWizard from './RemediationsModal';

const RemediationButton = ({
  isDisabled,
  children,
  dataProvider,
  onRemediationCreated,
  buttonProps,
}) => {
  const [hasPermissions, setHasPermissions] = useState(false);
  const [remediationsData, setRemediationsData] = useState();

  useEffect(() => {
    insights.chrome.getUserPermissions('remediations').then((permissions) => {
      setHasPermissions(
        permissions.some(({ permission }) => permission === CAN_REMEDIATE)
      );
    });
  }, []);

  if (!hasPermissions) {
    return (
      <Tooltip content="You do not have correct permissions to remediate this entity.">
        <span>
          <Button isDisabled {...buttonProps}>
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
        onClick={() => {
          Promise.resolve(dataProvider()).then((data) => {
            validate(data);
            setRemediationsData(data);
          });
        }}
        {...buttonProps}
      >
        {children}
      </Button>
      {remediationsData && (
        <RemediationWizard
          onRemediationCreated={onRemediationCreated}
          setOpen={(isOpen) =>
            setRemediationsData((prevData) =>
              isOpen === false ? null : prevData
            )
          }
          data={remediationsData || {}}
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
};

RemediationButton.defaultProps = {
  isDisabled: false,
  onRemediationCreated: (f) => f,
  children: 'Remediate with Ansible',
};

export default RemediationButton;
