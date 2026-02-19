import React from 'react';
import { Flex, FlexItem, Title, Switch, Content } from '@patternfly/react-core';
import propTypes from 'prop-types';
import { EXECUTION_LIMITS_HEADER_DESCRIPTION } from '../../routes/RemediationDetailsComponents/helpers';

export const PlanSummaryHeader = ({ autoReboot, onAutoRebootChange }) => {
  return (
    <Flex
      justifyContent={{
        default: 'justifyContentSpaceBetween',
      }}
      alignItems={{
        default: 'alignItemsCenter',
      }}
    >
      <FlexItem style={{ maxWidth: '75%' }}>
        <Title headingLevel="h3" size="md">
          Plan summary
        </Title>
        <Content component="p">
          {EXECUTION_LIMITS_HEADER_DESCRIPTION}
        </Content>
      </FlexItem>
      <FlexItem>
        <Switch
          id="auto-reboot-switch"
          label={autoReboot ? 'Auto-reboot is on' : 'Auto-reboot is off'}
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
