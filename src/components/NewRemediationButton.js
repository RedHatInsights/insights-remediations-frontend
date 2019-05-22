import React, { Component } from 'react';
import PropTypes from 'prop-types';

import * as actions from '../actions';

import { Wizard } from '@redhat-cloud-services/frontend-components';
import { Button } from '@patternfly/react-core';

import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';

// Wizard Steps
import PlanName from '../components/CreatePlanModal/ModalSteps/PlanName';

class NewRemediationButton extends Component {

    constructor (props, ctx) {
        super(props, ctx);
        this.props = props;
        this.store = ctx.store;
        this.state = {
            open: false
        };
    };

    setOpen = open => this.setState({ open });

    openModal = () => this.setOpen(true);

    closeModal = (submitted) => {
        this.setOpen(false);
        submitted && this.newRemediation(this.planNameStep.state.value);
    };

    newRemediation = (name) => {
        name = (!name || !name.length) ? 'Unnamed remediation' : name;

        this.store.dispatch(actions.createRemediation({
            name,
            add: {
                issues: [{
                    id: 'vulnerabilities:CVE_2017_6074_kernel|KERNEL_CVE_2017_6074',
                    resolution: 'selinux_mitigate'
                }, {
                    id: 'advisor:network_bond_opts_config_issue|NETWORK_BONDING_OPTS_DOUBLE_QUOTES_ISSUE'
                }],
                systems: [
                    '34b9f7d9-fc81-4e0f-bef0-c4b402a1510e',
                    'faa8c67c-345a-44b3-bb8a-d1bc89c36446',
                    'da8355c0-b259-490d-a9ec-8c1bc0ba7e98'
                ]
            }
        }))
        .then(({ value }) => {
            this.store.dispatch(addNotification({
                variant: 'success',
                title: 'Remediation created',
                description: `Remediation ${value.name} has been created`,
                dismissDelay: 8000
            }));

            return value;
        })
        .then(remediation => this.props.onCreated(remediation));
    }

    render() {
        // Wizard Content
        const steps = [
            <PlanName key='PlanName' ref={ ref => this.planNameStep = ref }/>
        ];

        return (
            <React.Fragment>
                <Button variant='primary' onClick={ () => this.openModal() }>Demo Remediation</Button>
                <Wizard
                    isLarge = { true }
                    title="Create remediation"
                    className='ins-c-plan-modal'
                    onClose = { this.closeModal }
                    isOpen= { this.state.open }
                    content = { steps }
                />
            </React.Fragment>
        );
    }
}

NewRemediationButton.contextTypes = {
    store: PropTypes.object
};

NewRemediationButton.propTypes = {
    onCreated: PropTypes.func
};

NewRemediationButton.defaultProps = {
    onCreated: f => f
};

export default NewRemediationButton;
