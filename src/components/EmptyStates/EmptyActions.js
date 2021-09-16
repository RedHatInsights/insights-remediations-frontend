import React from 'react';
import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  Title,
} from '@patternfly/react-core';
import PropTypes from 'prop-types';
import { appUrl } from '../../Utilities/urls';

export const EmptyActions = (filtered) => {
  return (
    <Bullseye className="pf-u-pt-2xl">
      <EmptyState>
        {filtered.filtered === true ? (
          <Title size="lg" headingLevel="h5">
            No actions found
          </Title>
        ) : (
          <Title size="lg" headingLevel="h5">
            This playbook is empty
          </Title>
        )}
        <EmptyStateBody>
          To add an action, select issues identified in
          <br />
          <a href={appUrl('advisor').toString()}>Recommendations</a>,&nbsp;
          <a href={appUrl('compliance').toString()}>Compliance</a> or&nbsp;
          <a href={appUrl('vulnerabilities').toString()}>Vulnerability</a>&nbsp;
          and select
          <br />
          <strong>Remediate with Ansible.</strong>
        </EmptyStateBody>
      </EmptyState>
    </Bullseye>
  );
};

EmptyActions.propTypes = {
  filtered: PropTypes.bool.isRequired,
};
