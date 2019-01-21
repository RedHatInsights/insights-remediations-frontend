import React from 'react';
import { RemediationButton } from '@red-hat-insights/insights-frontend-components';

import propTypes from 'prop-types';

import { getHosts } from '../api';

class TestButtons extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            allHosts: false
        };
    }

    dataProvider = (count = 4) => {
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
            }, {
                id: 'compliance:xccdf_org.ssgproject.content_rule_no_empty_passwords',
                description: 'Disallow empty passwords'
            }],
            systems: this.state.allHosts
        };

        data.issues = data.issues.slice(0, count);

        return data;
    }

    componentDidMount () {
        getHosts().then(hosts => this.setState({
            allHosts: hosts.results.map(result => result.id)
        }));
    }

    render () {
        const { allHosts } = this.state;
        const debug = localStorage.getItem('remediations:debug');

        if (debug !== 'true') {
            return null;
        }

        return (
            <React.Fragment>
                {
                    [ 1, 2, 3, 4 ].map(i =>
                        <RemediationButton
                            key={ i }
                            dataProvider={ this.dataProvider.bind(this, i) }
                            isDisabled={ !allHosts || !allHosts.length }
                            onRemediationCreated={ this.props.onRemediationCreated } >
                            Test Wizard ({ i })
                        </RemediationButton>
                    )
                }
            </React.Fragment>
        );
    }
}

TestButtons.propTypes = {
    onRemediationCreated: propTypes.func
};

TestButtons.defaultProps = {
    onRemediationCreated: f => f
};

export default TestButtons;
