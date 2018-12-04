import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as actions from '../actions';

import { Main, PageHeader, PageHeaderTitle, Wizard } from '@red-hat-insights/insights-frontend-components';
import { Button } from '@patternfly/react-core';
import RemediationTable from '../components/RemediationTable';
import NewRemediationButton from '../components/NewRemediationButton';

import { addNotification } from '@red-hat-insights/insights-frontend-components/components/Notifications';

// Wizard Steps
import PlanName from '../components/CreatePlanModal/ModalSteps/PlanName';
import PlanSystems from '../components/CreatePlanModal/ModalSteps/PlanSystems';

import './Home.scss';

const ConnectedRemediationTable = connect(({ remediations }) => ({ ...remediations }))(RemediationTable);

class Home extends Component {

    constructor (props, ctx) {
        super(props, ctx);
        this.store = ctx.store;
        this.loadRemediations = () => ctx.store.dispatch(actions.loadRemediations());
        this.state = {
            isModalOpen: false
        };
    };

    openModal = () => this.setState({ isModalOpen: true });

    onClose = submitted => {
        this.setState({
            isModalOpen: false
        });

        if (submitted) {
            this.sendNotification({
                variant: 'success',
                title: 'Wizard completed',
                description: 'Congratulations! You successfully clicked through the temporary wizard placeholder!'
            });
        }
    };

    componentDidMount () {
        window.insights.chrome.auth.getUser().then(this.loadRemediations);
    }

    sendNotification = data => {
        this.store.dispatch(addNotification(data));
    }

    render() {

        const { isModalOpen } = this.state;

        // Wizard Content
        const ModalStepContent = [
            <PlanName key='PlanName'/>,
            <PlanSystems key='PlanSystems'/>
        ];

        return (
            <React.Fragment>
                <PageHeader>
                    <PageHeaderTitle title='Remediations'></PageHeaderTitle>
                    <Button variant='primary' onClick={ this.openModal }>Create Remediation</Button>
                    <NewRemediationButton onCreated = { this.loadRemediations } />
                </PageHeader>
                <Main>
                    <ConnectedRemediationTable />
                </Main>

                <Wizard
                    isLarge
                    title="Create Plan"
                    className='ins-c-plan-modal'
                    onClose = { this.onClose }
                    isOpen= { isModalOpen }
                    content = { ModalStepContent }
                />
            </React.Fragment>
        );
    }
}

Home.contextTypes = {
    store: PropTypes.object
};

export default withRouter(Home);
