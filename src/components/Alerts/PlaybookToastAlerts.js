import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Alert,
  AlertGroup,
  AlertActionCloseButton
} from '@patternfly/react-core';

const PlaybookToastAlerts = ({
  title,
  description="",
  variant="success"
}) => {
  const [activeAlerts, setActiveAlerts] = useState([]);

  useEffect(() => {
      var newKey = generateUniqueId();
      addActiveAlert(newKey, title, description, variant);
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
      <AlertGroup isToast>
      {
        title === "" ? (<></>) : (
          activeAlerts.map(({key, title, description, variant}) =>
            (
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
            )
        ))}
        </AlertGroup>
    </div>
  )
}

PlaybookToastAlerts.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  variant: PropTypes.string
}

export default PlaybookToastAlerts;
