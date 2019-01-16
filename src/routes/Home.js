import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as actions from '../actions';
import { getHosts } from '../api';

import { Main, PageHeader, PageHeaderTitle, Wizard, RemediationButton } from '@red-hat-insights/insights-frontend-components';
import RemediationTable from '../components/RemediationTable';

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

    dataProvider = (count = 3) => {
        const data = {
            issues: [{
                id: 'advisor:network_bond_opts_config_issue|NETWORK_BONDING_OPTS_DOUBLE_QUOTES_ISSUE',
                description: 'Bonding will not fail over to the backup link when bonding options are partially read'
            }, {
                id: 'vulnerabilities:CVE_2017_6074_kernel|KERNEL_CVE_2017_6074',
                description: 'Kernel vulnerable to local privilege escalation via DCCP module (CVE-2017-6074)'
            }, {
                id: 'advisor:corosync_enable_rt_schedule|COROSYNC_NOT_ENABLE_RT',
                description: 'Cluster nodes are frequently fenced as realtime is not enabled in corosync'
            }],
            systems: this.state.allHosts
        };

        data.issues = data.issues.slice(0, count);

        return data;
    }

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
                    { !window.insights.chrome.isProd &&
                        [ 1, 2, 3 ].map(i =>
                            <RemediationButton
                                key={ i }
                                dataProvider={ this.dataProvider.bind(this, i) }
                                isDisabled={ !allHosts || !allHosts.length }
                                onRemediationCreated={ this.onRemediationCreated } >
                                Hot-loaded Wizard ({ i })
                            </RemediationButton>
                        )
                    }
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
