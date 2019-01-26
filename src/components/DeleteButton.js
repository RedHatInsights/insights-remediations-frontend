import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button } from '@patternfly/react-core';
import ConfirmationDialog from './ConfirmationDialog';

class DeleteButton extends Component {

    state = {
        dialogOpen: false
    };

    onButtonClicked = () => {
        this.setState({ dialogOpen: true });
    }

    onDialogClose = (result) => {
        this.setState({ dialogOpen: false });
        result && this.props.onDelete();
    }

    render() {

        const { dialogOpen } = this.state;

        return (
            <React.Fragment>
                <Button
                    onClick={ this.onButtonClicked }
                    isDisabled={ this.props.isDisabled }
                    variant="danger">
                    Delete
                </Button>
                {
                    dialogOpen &&
                    <ConfirmationDialog text={ this.props.dialogMessage } onClose={ this.onDialogClose } />
                }
            </React.Fragment>
        );
    }
};

DeleteButton.propTypes = {
    dialogMessage: PropTypes.string,
    isDisabled: PropTypes.bool,
    onDelete: PropTypes.func.isRequired
};

export default DeleteButton;
