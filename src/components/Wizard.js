import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { Modal, Button } from '@patternfly/react-core';

import CreatePlanModal from './CreatePlanModal/CreatePlanModal.js';

class Wizard extends Component {

    constructor () {
        super();
        this.state = {
            currentStep: 0
        };
        this.handlePreviousModalStep = this.handlePreviousModalStep.bind(this);
        this.handleNextModalStep = this.handleNextModalStep.bind(this);
    };

    handleNextModalStep() {
        this.setState(({ currentStep }) => ({
            currentStep: currentStep + 1
        }));
    }

    handlePreviousModalStep() {
        this.setState(({ currentStep }) => ({
            currentStep: currentStep - 1
        }));
    }

    render() {

        let renderModalActions =  [
            <Button key="cancel" variant="secondary" onClick={ this.props.handleModalToggle }>
            Cancel
            </Button>,
            // Conditionally render 'previous' button if not on first page
            this.state.currentStep > 0
                ? <Button key="previous" variant="secondary" onClick={ this.handlePreviousModalStep }> Previous </Button>
                : null,
            // Conditionally render 'confirm' button if on last page
            this.state.currentStep < this.props.steps - 1
                ? <Button key="continue" variant="primary" onClick={ this.handleNextModalStep }> Continue </Button>
                : <Button key="confirm" variant="primary" onClick={ this.props.handleModalToggle }> Confirm </Button>
        ];

        // TODO: Allow users to pass custom step content
        return (
            <React.Fragment>
                <Modal
                    isLarge = { this.props.isLarge }
                    title= { this.props.title }
                    className= { this.props.className }
                    isOpen={ this.props.isOpen }
                    onClose={ this.props.handleModalToggle }
                    actions={ renderModalActions }>
                    <CreatePlanModal step={ this.state.currentStep }/>
                </Modal>
            </React.Fragment>
        );
    }
}

Wizard.propTypes = {
    isLarge: PropTypes.bool,
    title: PropTypes.string,
    className: PropTypes.string,
    isOpen: PropTypes.any,
    handleModalToggle: PropTypes.any,
    steps: PropTypes.number
};

export default withRouter(Wizard);
