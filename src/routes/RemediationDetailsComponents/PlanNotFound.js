import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate/useInsightsNavigate';

/**
 * Empty state when Plan was not found in users account.
 *  @param   {object}        props        - Component props
 *  @param   {string}        props.planId - The ID of the plan that was not found
 *  @returns {React.Element}              PlanNotFound component
 */
const PlanNotFound = ({ planId }) => {
  const navigate = useInsightsNavigate();
  return (
    <EmptyState
      headingLevel="h5"
      icon={CubesIcon}
      titleText="Remediation Plan not found"
      variant={EmptyStateVariant.full}
    >
      <EmptyStateBody>
        Remediation Plan with ID {planId} does not exist
      </EmptyStateBody>
      <EmptyStateFooter>
        <Button
          variant="primary"
          onClick={() => navigate('/insights/remediations')}
        >
          Back to all remediation plans
        </Button>
      </EmptyStateFooter>
    </EmptyState>
  );
};

PlanNotFound.propTypes = {
  planId: PropTypes.string.isRequired,
};

export default PlanNotFound;
