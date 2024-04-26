import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import useNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate';

import { Button } from '@patternfly/react-core';
import {
  Dropdown,
  DropdownPosition,
  KebabToggle,
} from '@patternfly/react-core/deprecated';
import TextInputDialog from './Dialogs/TextInputDialog';
import ConfirmationDialog from './ConfirmationDialog';
import { deleteRemediation, patchRemediation } from '../actions';
import { dispatchNotification } from '../Utilities/dispatcher';

import { PermissionContext } from '../App';

const playbookNamePattern = /^$|^.*[\w\d]+.*$/;
const EMPTY_NAME = 'Unnamed Playbook';

function RemediationDetailsDropdown({
  remediation,
  onRename,
  onDelete,
  remediationsList,
}) {
  const [open, setOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const permission = useContext(PermissionContext);
  const navigate = useNavigate();

  return (
    <React.Fragment>
      {renameDialogOpen && (
        <TextInputDialog
          title="Edit playbook name"
          ariaLabel="Playbook name"
          value={remediation.name}
          onCancel={() => setRenameDialogOpen(false)}
          onSubmit={(name) => {
            setRenameDialogOpen(false);
            onRename(remediation.id, name);
            dispatchNotification({
              title: `Updated playbook name to ${name}`,
              description: '',
              variant: 'success',
              dismissable: true,
              autoDismiss: true,
            });
          }}
          pattern={playbookNamePattern}
          remediationsList={remediationsList}
        />
      )}

      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        title="Remove playbook?"
        text="You will not be able to recover this Playbook"
        confirmText="Remove playbook"
        onClose={(confirm) => {
          setDeleteDialogOpen(false);
          if (confirm) {
            onDelete(remediation.id);
            dispatchNotification({
              title: `Deleted playbook ${remediation.name}`,
              variant: 'success',
              dismissable: true,
              autoDismiss: true,
            });
            navigate('/');
          }
        }}
      />

      {permission.permissions.write && (
        <Dropdown
          onSelect={(f) => f}
          toggle={<KebabToggle onToggle={() => setOpen((value) => !value)} />}
          isOpen={open}
          position={DropdownPosition.right}
          isPlain
        >
          <Button onClick={() => setRenameDialogOpen(true)} variant="link">
            Rename
          </Button>
          <Button
            className="rem-c-button__danger-link"
            onClick={() => setDeleteDialogOpen(true)}
            variant="link"
            isDanger
          >
            Delete
          </Button>
        </Dropdown>
      )}
    </React.Fragment>
  );
}

RemediationDetailsDropdown.propTypes = {
  remediation: PropTypes.object.isRequired,
  onRename: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  remediationsList: PropTypes.array,
};

const connected = connect(null, (dispatch) => ({
  onRename: (id, name) => {
    if (!name) {
      name = EMPTY_NAME;
    }
    dispatch(patchRemediation(id, { name }));
  },
  onDelete: (id) => dispatch(deleteRemediation(id)),
}))(RemediationDetailsDropdown);

export default connected;
