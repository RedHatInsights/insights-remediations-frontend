import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Dropdown, KebabToggle } from '@patternfly/react-core';
import ConfirmationDialog from './ConfirmationDialog';

import './DeleteButton.scss';

class DropdownDelete extends Component {

    state = {
        dialogOpen: false,
        isDropdownOpen: false
    };

    onButtonClicked = () => {
        this.setState({ dialogOpen: true });
    }

    onDialogClose = (result) => {
        this.setState({ dialogOpen: false });
        result && this.props.onDelete();
    }

    onDropdownToggle = isDropdownOpen => {
        this.setState({
            isDropdownOpen
        });
    };

    onDropdownSelect = event => {
        this.setState({
            isDropdownOpen: !this.state.isDropdownOpen
        });
    };

    render() {

        const { isDropdownOpen, dialogOpen } = this.state;

        return (
            <React.Fragment>
                <Dropdown
                    onSelect={ this.onDropdownSelect }
                    toggle={ <KebabToggle onToggle={ this.onDropdownToggle } /> }
                    isOpen={ isDropdownOpen }
                    isPlain
                >
                    <Button
                        className=' ins-c-button__danger-link'
                        onClick={ this.onButtonClicked }
                        isDisabled={ this.props.isDisabled }
                        variant="link">
                        { this.props.label }
                    </Button>
                </Dropdown>
                {
                    dialogOpen &&
                    <ConfirmationDialog text={ this.props.dialogMessage } onClose={ this.onDialogClose } />
                }
            </React.Fragment>
        );
    }
};

DropdownDelete.propTypes = {
    label: PropTypes.string,
    dialogMessage: PropTypes.string,
    isDisabled: PropTypes.bool,
    onDelete: PropTypes.func.isRequired
};

DropdownDelete.defaultProps = {
    label: 'Delete'
};

export default DropdownDelete;
