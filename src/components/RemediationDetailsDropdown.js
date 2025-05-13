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

const EMPTY_NAME = 'Unnamed Playbook';

function RemediationDetailsDropdown({
  remediation,
  onRename,
  onDelete,
  remediationsList,
  updateRemPlan,
  refetch,
  refetchAllRemediations,
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
          title="Rename remediation plan?"
          ariaLabel="RenameModal"
          value={remediation.name}
          onCancel={() => setRenameDialogOpen(false)}
          onSubmit={(name) => {
            setRenameDialogOpen(false);
            updateRemPlan
              ? updateRemPlan({ id: remediation.id, name: name }).then(() => {
                  refetch(), refetchAllRemediations();
                })
              : onRename(remediation.id, name);

            dispatchNotification({
              title: `Updated playbook name to ${name}`,
              description: '',
              variant: 'success',
              dismissable: true,
              autoDismiss: true,
            });
          }}
          remediationsList={remediationsList}
        />
      )}

      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        title="Delete remediation plan?"
        text="Deleting a remediation plan is permanent and cannot be undone."
        confirmText="Delete"
        onClose={(confirm) => {
          setDeleteDialogOpen(false);
          if (confirm) {
            onDelete(remediation.id);
            dispatchNotification({
              title: `Deleted remediation plan ${remediation.name}`,
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
  updateRemPlan: PropTypes.func,
  refetch: PropTypes.func,
  refetchAllRemediations: PropTypes.func,
};

const connected = connect(null, (dispatch) => ({
  onRename: (id, name) => {
    if (!name) {
      name = EMPTY_NAME;
    }
    const trimmedName = name.trim();
    dispatch(patchRemediation(id, { name: trimmedName }));
  },
  onDelete: (id) => dispatch(deleteRemediation(id)),
}))(RemediationDetailsDropdown);

export default connected;
