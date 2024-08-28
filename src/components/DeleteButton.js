import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Button } from '@patternfly/react-core';
import ConfirmationDialog from './ConfirmationDialog';

import './DeleteButton.scss';

const DeleteButton = ({
  label,
  dialogTitle,
  dialogMessage,
  dialogConfirmationText,
  isDisabled,
  onDelete,
  variant,
}) => {
  const [isDialogOpen, setDialogOpen] = useState(false);

  const onDialogClose = (result) => {
    setDialogOpen(false);
    result && onDelete();
  };

  return (
    <React.Fragment>
      <Button
        onClick={() => setDialogOpen(true)}
        isDisabled={isDisabled}
        variant={variant}
      >
        {label}
      </Button>
      {isDialogOpen && (
        <ConfirmationDialog
          title={dialogTitle}
          confirmText={dialogConfirmationText}
          text={dialogMessage}
          onClose={onDialogClose}
        />
      )}
    </React.Fragment>
  );
};

DeleteButton.propTypes = {
  label: PropTypes.string,
  dialogTitle: PropTypes.string,
  dialogMessage: PropTypes.string,
  dialogConfirmationText: PropTypes.string,
  isDisabled: PropTypes.bool,
  onDelete: PropTypes.func.isRequired,
  variant: PropTypes.string,
};

DeleteButton.defaultProps = {
  label: 'Delete',
  variant: 'link',
};

export default DeleteButton;
