import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as actions from '../actions';
import { getHosts } from '../api';

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
            isModalOpen: false,
            allHosts: false
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

    async componentDidMount () {
        await window.insights.chrome.auth.getUser();

        this.loadRemediations();
        getHosts().then(hosts => this.setState({
            allHosts: hosts.results.map(result => result.id)
        }));
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
        systems: this.state.allHosts
    });

    onRemediationCreated = result => {
        this.sendNotification(result.getNotification());
        this.loadRemediations();
    };

    render() {

        const { isModalOpen, allHosts } = this.state;

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
                        isDisabled={ !allHosts || !allHosts.length }
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
