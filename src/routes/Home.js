import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as actions from '../actions';

import { Main, PageHeader, PageHeaderTitle, Wizard, RemediationButton } from '@red-hat-insights/insights-frontend-components';
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

    dataProvider = () => ({
        issues: [{
            id: 'vulnerabilities:CVE_2017_6074_kernel|KERNEL_CVE_2017_6074'
        }, {
            id: 'advisor:network_bond_opts_config_issue|NETWORK_BONDING_OPTS_DOUBLE_QUOTES_ISSUE'
        }],
        systems: [
            '34b9f7d9-fc81-4e0f-bef0-c4b402a1510e',
            'faa8c67c-345a-44b3-bb8a-d1bc89c36446',
            'da8355c0-b259-490d-a9ec-8c1bc0ba7e98'
        ]
    });

    onRemediationCreated = result => {
        this.sendNotification(result.getNotification());
        this.loadRemediations();
    };

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
                    <RemediationButton
                        dataProvider={ this.dataProvider }
                        onRemediationCreated={ this.onRemediationCreated } >
                        Hot-loaded Wizard
                    </RemediationButton>
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
