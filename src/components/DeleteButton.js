import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button } from '@patternfly/react-core';
import ConfirmationDialog from './ConfirmationDialog';

class DeleteButton extends Component {

    constructor (props) {
        super(props);
        this.state = {
            modalOpen: false
        };
    };

    onButtonClicked = () => {
        this.setState({ modalOpen: true });
    }

    onModalClose = (result) => {
        this.setState({ modalOpen: false });
        result && this.props.onDelete(this.props.remediation);
    }

    render() {

        const { modalOpen } = this.state;

        return (
            <React.Fragment>
                <Button onClick={ this.onButtonClicked }>Delete</Button>
                {
                    modalOpen &&
                    <ConfirmationDialog text="You will not be able to recover this remediation" onClose={ this.onModalClose } />
                }
            </React.Fragment>
        );
    }
};

DeleteButton.propTypes = {
    remediation: PropTypes.object.isRequired,
    onDelete: PropTypes.func.isRequired
};

export default DeleteButton;
