import React from 'react';
import { Button } from '@patternfly/react-core';
import { downloadPlaybook } from '../api';
import keyBy from 'lodash/keyBy';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';
import PropTypes from 'prop-types';
import { pluralize } from './utils';

const verifyDownload = (selectedIds, data) => {
  const byId = keyBy(data, (r) => r.id);
  return selectedIds?.reduce((result, id) => {
    const remediation = byId[id];
    if (
      (remediation && remediation?.issue_count > 0) ||
      remediation?.issues?.length > 0
    ) {
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
        title: 'Download failed',
        description: `There was ${pluralize(selectedIds.length, 'remediation plan')} selected, but none are eligible for download.`,
        variant: 'danger',
        dismissable: true,
        autoDismiss: true,
      }),
    );
  } else if (valid.length < selectedIds.length) {
    downloadPlaybook(valid);
    const skipped = selectedIds.length - valid.length;
    dispatch(
      addNotification({
        variant: 'info',
        title: `Downloading ${pluralize(valid.length, 'remediation plan')}`,
        description: `${skipped} empty remediation plan${skipped === 1 ? ' was' : 's were'} not downloaded`,
      }),
    );
  } else {
    downloadPlaybook(valid);
    dispatch(
      addNotification({
        title: `Download ready`,
        description: `Your playbook${valid.length > 1 ? 's are' : ' is'} downloading now.`,
        variant: 'success',
        dismissable: true,
        autoDismiss: true,
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
