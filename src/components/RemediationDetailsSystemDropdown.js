import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import {
  Button,
  Dropdown,
  DropdownPosition,
  KebabToggle,
} from '@patternfly/react-core';
import ConfirmationDialog from './ConfirmationDialog';
import { deleteRemediationIssueSystem } from '../actions';
import { getSystemName } from '../Utilities/model';

function RemediationDetailsSystemDropdown({
  remediation,
  issue,
  system,
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <React.Fragment>
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        text={`This playbook will not address ${
          issue.description
        } on ${getSystemName(system)}`}
        onClose={(value) => {
          setDeleteDialogOpen(false);
          value && onDelete(remediation.id, issue.id, system.id);
        }}
      />

      <Dropdown
        onSelect={(f) => f}
        toggle={<KebabToggle onToggle={() => setOpen((value) => !value)} />}
        isOpen={open}
        position={DropdownPosition.right}
        isPlain
      >
        <Button onClick={() => setDeleteDialogOpen(true)} variant="link">
          Remove system
        </Button>
      </Dropdown>
    </React.Fragment>
  );
}

RemediationDetailsSystemDropdown.propTypes = {
  remediation: PropTypes.object.isRequired,
  issue: PropTypes.object.isRequired,
  system: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const connected = withRouter(
  connect(null, (dispatch) => ({
    onDelete: (id, issue, system) =>
      dispatch(deleteRemediationIssueSystem(id, issue, system)),
  }))(RemediationDetailsSystemDropdown)
);

export default connected;
