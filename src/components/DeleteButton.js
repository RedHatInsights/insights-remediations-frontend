import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button } from '@patternfly/react-core';
import ConfirmationDialog from './ConfirmationDialog';

import './DeleteButton.scss';

class DeleteButton extends Component {
  state = {
    dialogOpen: false,
  };

  onButtonClicked = () => {
    this.setState({ dialogOpen: true });
  };

  onDialogClose = (result) => {
    this.setState({ dialogOpen: false });
    result && this.props.onDelete();
  };

  render() {
    const { dialogOpen } = this.state;

    return (
      <React.Fragment>
        <Button
          onClick={this.onButtonClicked}
          isDisabled={this.props.isDisabled}
          variant={this.props.variant}
        >
          {this.props.label}
        </Button>
        {dialogOpen && (
          <ConfirmationDialog
            title={this.props.dialogTitle}
            confirmText={this.props.dialogConfirmationText}
            text={this.props.dialogMessage}
            onClose={this.onDialogClose}
          />
        )}
      </React.Fragment>
    );
  }
}

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
