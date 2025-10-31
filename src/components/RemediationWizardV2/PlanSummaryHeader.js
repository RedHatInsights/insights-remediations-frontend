import React from 'react';
import { Flex, FlexItem, Title, Switch, Content } from '@patternfly/react-core';
import propTypes from 'prop-types';

export const PlanSummaryHeader = ({ autoReboot, onAutoRebootChange }) => {
  return (
    <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
      <FlexItem>
        <Title headingLevel="h3" size="md">
          Plan summary
        </Title>
        <Content component="p">
          Execution limits: 100 systems and 1000 action points*
        </Content>
      </FlexItem>
      <FlexItem>
        <Switch
          id="auto-reboot-switch"
          label="Auto-reboot is on"
          labelOff="Auto-reboot is off"
          style={{ paddingRight: '50px' }}
          isChecked={autoReboot}
          hasCheckIcon
          onChange={(_event, checked) => onAutoRebootChange(checked)}
        />
      </FlexItem>
    </Flex>
  );
};

PlanSummaryHeader.propTypes = {
  autoReboot: propTypes.bool.isRequired,
  onAutoRebootChange: propTypes.func.isRequired,
};
