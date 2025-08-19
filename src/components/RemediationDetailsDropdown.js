import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import useNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate';

import {
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';
import TextInputDialog from './Dialogs/TextInputDialog';
import ConfirmationDialog from './ConfirmationDialog';
import { deleteRemediation, patchRemediation } from '../actions';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';

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
  const addNotification = useAddNotification();

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
                  (refetch(), refetchAllRemediations());
                })
              : onRename(remediation.id, name);

            addNotification({
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
            addNotification({
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
          onSelect={() => setOpen(false)}
          toggle={(toggleRef) => (
            <MenuToggle
              ref={toggleRef}
              variant="plain"
              onClick={() => setOpen((value) => !value)}
              isExpanded={open}
            >
              <EllipsisVIcon />
            </MenuToggle>
          )}
          isOpen={open}
          popperProps={{ position: 'right' }}
        >
          <DropdownList>
            <DropdownItem
              key="rename"
              onClick={() => setRenameDialogOpen(true)}
            >
              Rename
            </DropdownItem>
            <DropdownItem
              key="delete"
              onClick={() => setDeleteDialogOpen(true)}
              isDanger
            >
              Delete
            </DropdownItem>
          </DropdownList>
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
