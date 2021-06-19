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
  // const [currentAlertID, setCurrentAlertID] = useState('');
  const [activeAlerts, setActiveAlerts] = useState([]);

  useEffect(() => {
      console.log('Checking PINGAAAAAAAAAAA');
      var newKey = generateUniqueId();
      var newAlert = {newKey, title, description, variant};
      console.log('Checking new alert being created: ', newAlert);
      
      addActiveAlert(newKey, title, description, variant);
      console.log('Checking my new activeAlerts', activeAlerts);
  }, []);
  
  const removeAlert = (key) => {
    setActiveAlerts([...activeAlerts.filter((alert) => alert.key !== key)]);
  };
  
  const addActiveAlert = (key, title, description, variant) => {
    setActiveAlerts( activeAlerts => [...activeAlerts, { key:key, title:title, description:description, variant:variant}]);
  };

  const generateUniqueId = () => new Date().getTime();

  console.log('Checking alert about to be rendered: ', activeAlerts);

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
