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
      console.log('CHECKING: confirming that were creating a new alert.')
      console.log('Checking out what we have in queue to become a toast alert: ', title);
      console.log('checking description: ', description);
      console.log('checking variant: ', variant);
      addActiveAlert(newKey, title, description, variant);
  }, [title]);
  
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
        // title === "" ? (<></>) : (
          activeAlerts.map(({key, title, description, variant}) =>
            (
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
                }>
                {description}
              </Alert>  
            )
        )}
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
