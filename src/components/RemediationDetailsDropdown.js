import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import useNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate';

import {
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';
import RenameModal from './RenameModal';
import ConfirmationDialog from './ConfirmationDialog';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import useRemediationsQuery from '../api/useRemediationsQuery';

import { PermissionContext } from '../App';

function RemediationDetailsDropdown({
  remediation,
  remediationsList,
  refetch,
  refetchAllRemediations,
}) {
  const [open, setOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const permission = useContext(PermissionContext);
  const navigate = useNavigate();
  const addNotification = useAddNotification();

  const { fetch: deleteRemediation } = useRemediationsQuery(
    'deleteRemediation',
    {
      skip: true,
    },
  );

  const handleDelete = async (id) => {
    try {
      await deleteRemediation({ id });
      addNotification({
        title: `Deleted remediation plan ${remediation.name}`,
        variant: 'success',
        dismissable: true,
        autoDismiss: true,
      });
      navigate('/');
    } catch (error) {
      console.error(error);
      addNotification({
        title: `Failed to delete remediation plan`,
        variant: 'danger',
        dismissable: true,
        autoDismiss: true,
      });
    }
  };

  return (
    <React.Fragment>
      {renameDialogOpen && (
        <RenameModal
          remediation={remediation}
          setIsRenameModalOpen={setRenameDialogOpen}
          remediationsList={remediationsList}
          fetch={refetch}
          refetch={refetchAllRemediations}
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
            handleDelete(remediation.id);
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
  remediationsList: PropTypes.array,
  refetch: PropTypes.func,
  refetchAllRemediations: PropTypes.func,
};

export default RemediationDetailsDropdown;
