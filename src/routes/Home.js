import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as actions from '../actions';

import { Main, PageHeader, PageHeaderTitle, Wizard } from '@redhat-cloud-services/frontend-components';
import RemediationTable from '../components/RemediationTable';
import TestButtons from '../components/TestButtons';

import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';

// Wizard Steps
import PlanName from '../components/CreatePlanModal/ModalSteps/PlanName';
import PlanSystems from '../components/CreatePlanModal/ModalSteps/PlanSystems';

import './Home.scss';

import { PermissionContext } from '../App';
import DeniedState from '../components/DeniedState';

const ConnectedRemediationTable = connect(({ remediations }) => ({ ...remediations }))(RemediationTable);

class Home extends Component {

    constructor (props, ctx) {
        super(props, ctx);
        this.state = {
            isModalOpen: false,
            selected: []
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

    sendNotification = data => {
        const { addNotification } = this.props;
        addNotification(data);
    }

    onRemediationCreated = result => {
        const { loadRemediations } = this.props;
        this.sendNotification(result.getNotification());
        loadRemediations();
    };

    onSelect = selected => this.setState({ selected });

    render() {

        const { isModalOpen } = this.state;
        const { loadRemediations } = this.props;

        // Wizard Content
        const ModalStepContent = [
            <PlanName key='PlanName'/>,
            <PlanSystems key='PlanSystems'/>
        ];

        return (
            <PermissionContext.Consumer>
                { value =>
                    value.permissions.read === false
                        ? <DeniedState/>
                        : <React.Fragment>
                            <PageHeader>
                                <PageHeaderTitle title='Remediations'/>
                                <TestButtons onRemediationCreated={ this.onRemediationCreated } />
                            </PageHeader>
                            <Main>
                                <ConnectedRemediationTable loadRemediations={ loadRemediations } />
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
                }
            </PermissionContext.Consumer>
        );
    }
}

Home.propTypes = {
    loadRemediations: PropTypes.func,
    addNotification: PropTypes.func
};

export default withRouter(connect(null, (dispatch) => ({
    loadRemediations: (...args)  => dispatch(actions.loadRemediations(...args)),
    addNotification: (data) => dispatch(addNotification(data))
}))(Home));
