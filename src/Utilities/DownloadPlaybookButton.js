import React from 'react';
import { Button } from '@patternfly/react-core';
import { downloadPlaybook } from '../api';
import { dispatchNotification } from './dispatcher';
import keyBy from 'lodash/keyBy';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';
import PropTypes from 'prop-types';

const verifyDownload = (selectedIds, data) => {
  const byId = keyBy(data, (r) => r.id);

  return selectedIds?.reduce((result, id) => {
    const remediation = byId[id];

    if (remediation && remediation.issue_count > 0) {
      result.push(remediation.id);
    }

    return result;
  }, []);
};

export const download = (selectedIds, data, dispatch) => {
  const valid = verifyDownload(selectedIds, data);

  if (valid.length === 0) {
    dispatch(
      addNotification({
        variant: 'danger',
        title: 'No remediation plans downloaded.',
      }),
    );
  } else if (valid.length < selectedIds.length) {
    downloadPlaybook(valid);
    dispatch(
      addNotification({
        variant: 'success',
        title: `Downloading remediation plan${valid.length > 1 ? 's' : ''}`,
        description: `${
          selectedIds.length - valid.length
        } empty remediation plans were not downloaded`,
      }),
    );
  } else {
    downloadPlaybook(valid);
    dispatch(
      addNotification({
        variant: 'success',
        title: `Downloading remediation plan${
          selectedIds.length > 1 ? 's' : ''
        }`,
      }),
    );
  }
};

export const DownloadPlaybookButton = ({
  selectedItems = [],
  data,
  dispatch,
}) => {
  return (
    <Button
      isDisabled={selectedItems?.length < 1}
      variant="primary"
      onClick={() => {
        download(selectedItems, data, dispatch);
        dispatchNotification({
          title: `Your remediation plan${
            selectedItems.length > 1 ? 's' : ''
          } will be downloaded shortly`,
          variant: 'info',
          dismissable: true,
          autoDismiss: true,
        });
      }}
    >
      {`Download`}
    </Button>
  );
};

DownloadPlaybookButton.propTypes = {
  selectedItems: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  dispatch: PropTypes.func,
};
