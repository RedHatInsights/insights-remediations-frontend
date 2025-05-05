import React from 'react';
import { Button, pluralize } from '@patternfly/react-core';
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
        description: ` ${pluralize(
          selectedIds.length,
          'Selected remediation does not',
          'Selected remediations do not'
        )}`,
      })
    );
  } else if (valid.length < selectedIds.length) {
    downloadPlaybook(valid);
    dispatch(
      addNotification({
        variant: 'success',
        title: `Downloading remediation ${pluralize(
          valid.length,
          'plan',
          'plans'
        )}`,
        description: `${
          selectedIds.length - valid.length
        } empty remediaton plan was not downloaded`,
      })
    );
  } else {
    downloadPlaybook(valid);
    dispatch(
      addNotification({
        variant: 'success',
        title: `Downloading remediation ${pluralize(
          valid.length,
          'plan',
          'plans'
        )}`,
      })
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
          title: `Your remediation ${pluralize(
            selectedItems.length,
            'plan',
            'plans'
          )} will be downloaded shortly`,
          description: 'Once complete, your download will start automatically.',
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
