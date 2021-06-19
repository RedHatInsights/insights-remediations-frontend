import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Alert,
  AlertGroup,
  AlertActionCloseButton
} from '@patternfly/react-core';

const PlaybookToastAlerts = ({
  key,
  title,
  description="",
  variant="success"
}) => {
  const [currentAlertID, setCurrentAlertID] = useState('');
  const [activeAlerts, setActiveAlerts] = useState([]);

  useEffect(() => {
    console.log("Checking inside playbook toaast alerts effect for key: ", key);
    console.log("Checking inside playbook toaast alerts effect for title: ",  title);
    console.log("Checking inside playbook toaast alerts effect for description: ",  description);
    console.log("Checking inside playbook toaast alerts effect for variant: ", variant);
    console.log("Checking inside playbook toaast alerts effect for activeAlerts: ",  activeAlerts);
    console.log("Checking inside playbook toaast alerts effect for activeAlerts.length: ",  activeAlerts.length);
    console.log("Checking inside playbook toaast alerts effect for currentAlertID: ",  currentAlertID);

    if(activeAlerts.length === 0) {
      console.log('Checking PINGAAAAAAAAAAA');
      addActiveAlert([...activeAlerts, {key, title, description, variant}]);
      return;
    }
  }, []);
  
  const removeAlert = (key) => {
    setActiveAlerts([...activeAlerts.filter((alert) => alert.key !== key)]);
  };
  
  const addActiveAlert = (key, title, description, variant) => {
    setCurrentAlertID(key);
    setActiveAlerts([...activeAlerts, { key:key, title:title, description:description, variant:variant}]);
  };

  const generateUniqueId = () => new Date().getTime();

  return (
    <div>
      {
        key === "" ? (<></>) : (
          activeAlerts.map(({key, title, description, variant}) =>
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
  key: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  variant: PropTypes.string
}

export default PlaybookToastAlerts;
