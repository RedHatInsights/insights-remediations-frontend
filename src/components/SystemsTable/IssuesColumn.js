import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@patternfly/react-core';
import SystemIssuesModal from './SystemIssuesModal/SystemIssuesModal';

const IssuesColumn = ({ issues, display_name, systemId, remediationId }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (typeof issues === 'number') {
    return (
      <>
        <Button
          size="sm"
          style={{ padding: '0', textDecoration: 'underline' }}
          variant="link"
          onClick={() => setIsOpen(true)}
        >
          {`${issues} action${issues !== 1 ? 's' : ''}`}
        </Button>
        {isOpen && (
          <SystemIssuesModal
            remediationId={remediationId}
            systemId={systemId}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            systemName={display_name}
          />
        )}
      </>
    );
  }

  return (
    <span>{`${issues.length} action${issues.length > 1 ? 's' : ''}`}</span>
  );
};

IssuesColumn.propTypes = {
  issues: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.shape()),
  ]),
  display_name: PropTypes.string,
  systemId: PropTypes.string,
  remediationId: PropTypes.string,
};

export default IssuesColumn;
