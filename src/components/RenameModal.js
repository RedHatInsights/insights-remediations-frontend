import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

// import { PermissionContext } from '../App';
import TextInputDialog from './Dialogs/TextInputDialog';
import { dispatchNotification } from '../Utilities/dispatcher';
import { deleteRemediation } from '../actions';
import { patchRemediation } from '../api';

const EMPTY_NAME = 'Unnamed Playbook';

const RenameModal = ({
  remediation,
  setIsRenameModalOpen,
  remediationsList,
}) => {
  // const permission = useContext(PermissionContext);
  console.log(remediation, 'rem here');
  return (
    <React.Fragment>
      <TextInputDialog
        title="Edit playbook name"
        ariaLabel="Playbook name"
        value={remediation.name}
        onCancel={() => setIsRenameModalOpen(false)}
        onSubmit={(name) => {
          setIsRenameModalOpen(false);
          dispatchNotification({
            title: `Updated playbook name to ${name}`,
            description: '',
            variant: 'success',
            dismissable: true,
            autoDismiss: true,
          });
        }}
        remediationsList={remediationsList ? remediationsList : []}
      />
    </React.Fragment>
  );
};

RenameModal.propTypes = {
  remediation: PropTypes.object.isRequired,
  onRename: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  remediationsList: PropTypes.array,
  setIsRenameModalOpen: PropTypes.func,
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
}))(RenameModal);

export default connected;
