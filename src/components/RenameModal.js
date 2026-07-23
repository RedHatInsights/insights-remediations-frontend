import React from 'react';
import PropTypes from 'prop-types';
import TextInputDialog from './Dialogs/TextInputDialog';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import useRemediations from '../Utilities/Hooks/api/useRemediations';
import { updateRemediationWrapper } from '../routes/api';

const EMPTY_NAME = 'Unnamed Playbook';

const RenameModal = ({
  remediation,
  setIsRenameModalOpen,
  remediationsList,
  fetch,
  refetch,
}) => {
  const addNotification = useAddNotification();
  const chrome = useChrome();
  const { fetch: updateRemediation } = useRemediations(
    updateRemediationWrapper,
    {
      skip: true,
    },
  );

  const handleRename = async (id, name) => {
    if (!name) {
      name = EMPTY_NAME;
    }
    const trimmedName = name.trim();

    try {
      await updateRemediation({ id, name: trimmedName });
      chrome.analytics?.track('remediations - Plan Renamed', {
        module: 'remediations',
        remediation_id: id,
      });
      addNotification({
        title: `Remediation plan renamed`,
        variant: 'success',
        dismissable: true,
        autoDismiss: true,
      });
    } catch (error) {
      console.error(error);
      addNotification({
        title: `Failed to update plan name`,
        variant: 'danger',
        dismissable: true,
        autoDismiss: true,
      });
    }
  };

  return (
    <TextInputDialog
      title="Rename remediation plan?"
      ariaLabel="RenameModal"
      value={remediation.name}
      onCancel={() => setIsRenameModalOpen(false)}
      onSubmit={async (name) => {
        setIsRenameModalOpen(false);
        await handleRename(remediation.id, name);

        fetch && fetch();
        refetch && refetch();
      }}
      remediationsList={remediationsList ?? []}
      refetch={refetch}
    />
  );
};

RenameModal.propTypes = {
  remediation: PropTypes.object.isRequired,
  remediationsList: PropTypes.array,
  setIsRenameModalOpen: PropTypes.func,
  fetch: PropTypes.func,
  refetch: PropTypes.func,
};

export default RenameModal;
