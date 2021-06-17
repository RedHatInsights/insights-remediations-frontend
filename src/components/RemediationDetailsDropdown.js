import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import {
  Button,
  Dropdown,
  DropdownPosition,
  KebabToggle,
  Alert,
  AlertGroup,
  AlertActionCloseButton
} from '@patternfly/react-core';
import TextInputDialog from './Dialogs/TextInputDialog';
import ConfirmationDialog from './ConfirmationDialog';
import { deleteRemediation, patchRemediation } from '../actions';

import { PermissionContext } from '../App';

const playbookNamePattern = /^$|^.*[\w\d]+.*$/;
const EMPTY_NAME = 'Unnamed Playbook';

function RemediationDetailsDropdown({ remediation, onRename, onDelete }) {
  const [open, setOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const permission = useContext(PermissionContext);

  /** This is Toast alert stuff for testing, will probably be extrapolated into its own manager. */
  // const [alertMessage, setAlertMessage] = useState('');
  const [activeAlerts, setActiveAlerts] = useState([]);
  const removeAlert = (key) => {
    setActiveAlerts([...activeAlerts.filter((alert) => alert.key !== key)]);
  };
  const addActiveAlert = (key, title, variant) => {
    setActiveAlerts([...activeAlerts, { title:title, variant:variant, key}]);
  };

  return (
    <React.Fragment>
      { activeAlerts.map(({key, title, variant}) =>
          (
            <AlertGroup isToast>
              <Alert
                timeout
                isLiveRegion
                key={key}
                variant={variant}
                title={title}
                actionClose={
                  <AlertActionCloseButton
                    title={title}
                    onClose={() => removeAlert(key)}
                  />
                }
              />
            </AlertGroup>
          )
      )}
      {renameDialogOpen && (
        <TextInputDialog
          title="Edit playbook name"
          ariaLabel="Playbook name"
          value={remediation.name}
          onCancel={() => setRenameDialogOpen(false)}
          onSubmit={(name) => {
            setRenameDialogOpen(false);
            onRename(remediation.id, name);
            addActiveAlert(remediation.id, `Updated playbook name to ${name}`, 'success');
          }}
          pattern={playbookNamePattern}
        />
      )}

      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        text="You will not be able to recover this Playbook"
        onClose={(confirm) => {
          setDeleteDialogOpen(false);
          confirm && onDelete(remediation.id);
          addActiveAlert(remediation.id, `Deleted playbook ${name}`, 'success');
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
            className=" ins-c-button__danger-link"
            onClick={() => setDeleteDialogOpen(true)}
            variant="link"
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
};

const connected = withRouter(
  connect(null, (dispatch, { history }) => ({
    onRename: (id, name) => {
      if (!name) {
        name = EMPTY_NAME;
      }

      dispatch(patchRemediation(id, { name }));
    },
    onDelete: async (id) => {
      await dispatch(deleteRemediation(id));
      history.push('/');
    },
  }))(RemediationDetailsDropdown)
);

export default connected;
