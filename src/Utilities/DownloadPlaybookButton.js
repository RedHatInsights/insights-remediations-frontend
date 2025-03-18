import React from 'react';
import { Button } from '@patternfly/react-core';
import { downloadPlaybook } from '../api';
import { dispatchNotification } from './dispatcher';
import keyBy from 'lodash/keyBy';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';

const verifyDownload = (selectedIds, data) => {
  const byId = keyBy(data, (r) => r.id);

  return selectedIds.reduce((result, id) => {
    const remediation = byId[id];

    if (remediation && remediation.issue_count > 0) {
      result.push(remediation.id);
    }

    return result;
  }, []);
};

const download = (selectedIds, data, dispatch) => {
  const valid = verifyDownload(selectedIds, data);

  if (valid.length === 0) {
    dispatch(
      addNotification({
        variant: 'danger',
        title: 'No playbooks downloaded.',
        description:
          selectedIds.length > 1
            ? 'Selected remediations do not contain any issues to remediate.'
            : 'Selected remediation does not contain any issues to remediate.',
      })
    );
  } else if (valid.length < selectedIds.length) {
    downloadPlaybook(valid);
    dispatch(
      addNotification({
        variant: 'success',
        title:
          valid.length > 1 ? 'Downloading playbooks' : 'Downloading playbook',
        description: `${
          selectedIds.length - valid.length
        } remediations with no issues were not downloaded.`,
      })
    );
  } else {
    downloadPlaybook(valid);
    dispatch(
      addNotification({
        variant: 'success',
        title:
          valid.length > 1 ? 'Downloading playbooks' : 'Downloading playbook',
      })
    );
  }
};

export const DownloadPlaybookButton = (selectedItems, data, dispatch) => {
  return (
    <Button
      isDisabled={selectedItems.length < 1}
      variant="primary"
      onClick={() => {
        download(selectedItems, data, dispatch);
        dispatchNotification({
          title: 'Preparing playbook for download.',
          description: 'Once complete, your download will start automatically.',
          variant: 'info',
          dismissable: true,
          autoDismiss: true,
        });
      }}
    >
      {`Download playbook${selectedItems.length > 1 ? 's' : ''}`}
    </Button>
  );
};
