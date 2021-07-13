import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  AlertGroup,
  AlertActionCloseButton,
} from '@patternfly/react-core';

const PlaybookToastAlerts = ({
  key,
  title,
  description = '',
  variant = 'success',
}) => {
  const [activeAlerts, setActiveAlerts] = useState([]);

  useEffect(() => {
    addActiveAlert(key, title, description, variant);
  }, [key]);

  const removeAlert = (key) => {
    setActiveAlerts((previousAlerts) => [
      previousAlerts.filter((alert) => alert.key !== key),
    ]);
  };

  const addActiveAlert = (key, title, description, variant) => {
    setActiveAlerts((activeAlerts) => [
      ...activeAlerts,
      { key: key, title: title, description: description, variant: variant },
    ]);
  };

  return (
    <div>
      <AlertGroup isToast>
        {activeAlerts.map(({ key, title, description, variant }) => (
          <Alert
            timeout
            isLiveRegion
            key={key}
            variant={variant}
            title={title}
            onTimeout={() => removeAlert(key)}
            actionClose={
              <AlertActionCloseButton
                title={title}
                onClose={() => removeAlert(key)}
              />
            }
          >
            {description}
          </Alert>
        ))}
      </AlertGroup>
    </div>
  );
};

PlaybookToastAlerts.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  variant: PropTypes.string,
  key: PropTypes.string,
};

export const generateUniqueId = () => new Date().getTime();

export default PlaybookToastAlerts;
