import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Alert,
  AlertGroup,
  AlertActionCloseButton
} from '@patternfly/react-core';

const PlaybookToastAlerts = ({
  title="Title",
  key="",
  description="",
  variant="success"
}) => {
  const [currentAlertID, setCurrentAlertID] = useState('');
  const [activeAlerts, setActiveAlerts] = useState([]);

  useEffect(() => {
    console.log("Checking inside playbook toaast alerts effect: ", key);

    if(key === currentAlertID || key === "" || title === "")
      return;

    if(activeAlerts.length == 0) {
      addActiveAlert(key, title, variant);
    }

    if(activeAlerts.length !== 0 && !activeAlerts.includes(key)) {
      addActiveAlert(key, title, variant);
    }
  }, [key]);
  
  const removeAlert = (key) => {
    setActiveAlerts([...activeAlerts.filter((alert) => alert.key !== key)]);
  };
  
  const addActiveAlert = (key, title, variant) => {
    setCurrentAlertID(key);
    setActiveAlerts([...activeAlerts, { title:title, variant:variant, key}]);
  };

  return (
    <div>
      {
        key === "" ? (<></>) : (
          activeAlerts.map(({key, title, variant}) =>
            (
              <AlertGroup isToast>
                <Alert
                  timeout
                  isLiveRegion
                  key={key}
                  variant={variant}
                  title={title}
                  actionClose={
                    <AlertActionCloseButton 
                      title={title}
                      onClose={() => removeAlert(key)}
                    />
                  }>
                  {description}
                </Alert>  
              </AlertGroup>
            )
        ))}
    </div>
  )
}

PlaybookToastAlerts.propTypes = {
  title: PropTypes.string.isRequired,
  key: PropTypes.string.isRequired,
  description: PropTypes.string,
  variant: PropTypes.string
}

export default PlaybookToastAlerts;
