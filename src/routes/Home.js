import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as actions from '../actions';

import { Main, PageHeader, PageHeaderTitle } from '@red-hat-insights/insights-frontend-components';
import { Modal, Button } from '@patternfly/react-core';
import RemediationTable from '../components/RemediationTable';

import CreatePlanModal from '../components/CreatePlanModal/CreatePlanModal.js';

import './Home.scss';

const ConnectedRemediationTable = connect(({ remediations }) => ({ ...remediations }))(RemediationTable);

class Home extends Component {

    constructor (props, ctx) {
        super(props, ctx);
        this.loadRemediations = () => ctx.store.dispatch(actions.loadRemediations());
        this.state = {
            isModalOpen: false,
            modalStep: 0
        };
        this.handlePreviousModalStep = this.handlePreviousModalStep.bind(this);
        this.handleNextModalStep = this.handleNextModalStep.bind(this);
        this.handleModalToggle = this.handleModalToggle.bind(this);
    };

    handleModalToggle() {
        this.setState(({ isModalOpen }) => ({
            isModalOpen: !isModalOpen,
            modalStep: 0
        }));
    };

    handleNextModalStep() {
        this.setState(({ modalStep }) => ({
            modalStep: modalStep + 1
        }));
    }

    handlePreviousModalStep() {
        this.setState(({ modalStep }) => ({
            modalStep: modalStep - 1
        }));
    }

    componentDidMount () {
        window.insights.chrome.auth.getUser().then(this.loadRemediations);
    }

    render() {

        const { isModalOpen } = this.state;

        let renderModalActions =  [
            <Button key="cancel" variant="secondary" onClick={ this.handleModalToggle }>
            Cancel
            </Button>,
            // Conditionally render 'previous' button if not on first page
            this.state.modalStep > 0
                ? <Button key="previous" variant="secondary" onClick={ this.handlePreviousModalStep }> Previous </Button>
                : null,
            // Conditionally render 'confirm' button if on last page
            this.state.modalStep < 5
                ? <Button key="continue" variant="primary" onClick={ this.handleNextModalStep }> Continue </Button>
                : <Button key="confirm" variant="primary" onClick={ this.handleModalToggle }> Confirm </Button>
        ];

        return (
            <React.Fragment>
                <PageHeader>
                    <PageHeaderTitle title='Remediations'></PageHeaderTitle>
                    <Button variant='primary' onClick={ this.handleModalToggle }>Create Plan</Button>
                </PageHeader>
                <Main>
                    <ConnectedRemediationTable />
                </Main>

                <Modal
                    isLarge
                    title="Create Plan"
                    className='ins-c-plan-modal'
                    isOpen={ isModalOpen }
                    onClose={ this.handleModalToggle }
                    actions={ renderModalActions }
                >
                    <CreatePlanModal step={ this.state.modalStep }/>
                </Modal>
            </React.Fragment>
        );
    }
}

Home.contextTypes = {
    store: PropTypes.object
};

export default withRouter(Home);
