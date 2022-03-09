import React, { useEffect, useState } from 'react';

import propTypes from 'prop-types';
import validate from './RemediationsModal/validate';

import { CAN_REMEDIATE, matchPermissions } from '../Utilities/utils';
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
        permissions.some(({ permission }) =>
          matchPermissions(permission, CAN_REMEDIATE)
        )
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
          setOpen={(isOpen) =>
            setRemediationsData((prevData) =>
              isOpen === false ? null : prevData
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
};

RemediationButton.defaultProps = {
  isDisabled: false,
  onRemediationCreated: (f) => f,
  children: 'Remediate with Ansible',
};

export default RemediationButton;
