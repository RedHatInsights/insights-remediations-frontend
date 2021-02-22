import React from 'react';

import { Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';
import RemediationButton from '@redhat-cloud-services/frontend-components-remediations/RemediationButton/';

import propTypes from 'prop-types';

import { getHosts } from '../api';

class TestButtons extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allHosts: false,
    };
  }

  isEnabled = () => localStorage.getItem('remediations:debug') === 'true';

  dataProviderPing = () => ({
    issues: [
      {
        id: 'test:ping',
        description: 'Ansible ping',
      },
    ],
    systems: this.state.allHosts,
  });

  dataProviderA1 = () => ({
    issues: [
      {
        id: 'vulnerabilities:CVE-2019-3815',
        description: 'CVE-2019-3815',
      },
    ],
    systems: this.state.allHosts,
  });

  dataProviderA2 = () => ({
    issues: [
      {
        id:
          'advisor:network_bond_opts_config_issue|NETWORK_BONDING_OPTS_DOUBLE_QUOTES_ISSUE',
        description:
          'Bonding will not fail over to the backup link when bonding options are partially read',
        systems: this.state.allHosts.slice(0, 5),
      },
    ],
  });

  dataProviderC1 = () => ({
    issues: [
      {
        id: 'vulnerabilities:CVE-2019-3815',
        description: 'CVE-2019-3815',
      },
      {
        id: 'vulnerabilities:CVE-2018-16865',
        description: 'CVE-2018-16865',
      },
      {
        id: 'vulnerabilities:CVE-2017-17712',
        description: 'CVE-2017-17712',
      },
    ],
    systems: this.state.allHosts.slice(-1),
  });

  dataProviderC2 = () => ({
    issues: [
      {
        id:
          'advisor:network_bond_opts_config_issue|NETWORK_BONDING_OPTS_DOUBLE_QUOTES_ISSUE',
        description:
          'Bonding will not fail over to the backup link when bonding options are partially read',
      },
      {
        id: 'advisor:rhnsd_pid_world_write|RHNSD_PID_WORLD_WRITABLE',
        description:
          'Code injection risk or wrong pid altering when rhnsd daemon file rhnsd.pid is world writable, due to a bug in rhnsd',
      },
    ],
    systems: this.state.allHosts.slice(-1),
  });

  dataProviderC3 = () => ({
    issues: [...this.dataProviderC1().issues, ...this.dataProviderC2().issues],
    systems: this.state.allHosts.slice(-1),
  });

  dataProviderC4 = () => ({
    issues: [
      {
        id:
          'advisor:network_bond_opts_config_issue|NETWORK_BONDING_OPTS_DOUBLE_QUOTES_ISSUE',
        description:
          'Bonding will not fail over to the backup link when bonding options are partially read',
      },
      {
        id: 'advisor:corosync_enable_rt_schedule|COROSYNC_NOT_ENABLE_RT',
        description:
          'Cluster nodes are frequently fenced as realtime is not enabled in corosync',
      },
      {
        id: 'advisor:CVE_2017_6074_kernel|KERNEL_CVE_2017_6074',
        description:
          'Kernel vulnerable to local privilege escalation via DCCP module (CVE-2017-6074)',
      },
    ],
    systems: this.state.allHosts.slice(-1),
  });

  dataProviderC5 = () => ({
    issues: [
      {
        id: 'advisor:unsupported',
        description: 'Unsupported issue',
      },
      {
        id: 'vulnerabilities:CVE-2019-999999',
        description: 'Unsupported issue',
      },
      {
        id: 'advisor:CVE_2017_6074_kernel|KERNEL_CVE_2017_6074',
        description:
          'Kernel vulnerable to local privilege escalation via DCCP module (CVE-2017-6074)',
      },
    ],
    systems: this.state.allHosts.slice(-1),
  });

  dataProviderD1 = () => ({
    issues: [
      {
        id: 'vulnerabilities:CVE-2019-3815',
        description: 'CVE-2019-3815',
        systems: this.state.allHosts.slice(0, 1),
      },
      {
        id: 'vulnerabilities:CVE-2018-16865',
        description: 'CVE-2018-16865',
        systems:
          this.state.allHosts.length > 1
            ? this.state.allHosts.slice(1, 2)
            : this.state.allHosts.slice(0, 1),
      },
      {
        id: 'vulnerabilities:CVE-2017-17712',
        description: 'CVE-2017-17712',
      },
    ],
    systems: this.state.allHosts,
  });

  dataProviderD2 = () => ({
    issues: [
      {
        id:
          'advisor:network_bond_opts_config_issue|NETWORK_BONDING_OPTS_DOUBLE_QUOTES_ISSUE',
        description:
          'Bonding will not fail over to the backup link when bonding options are partially read',
        systems: this.state.allHosts.slice(0, 1),
      },
      {
        id: 'advisor:rhnsd_pid_world_write|RHNSD_PID_WORLD_WRITABLE',
        description:
          'Code injection risk or wrong pid altering when rhnsd daemon file rhnsd.pid is world writable, due to a bug in rhnsd',
        systems: this.state.allHosts.slice(1),
      },
    ],
  });

  async componentDidMount() {
    if (this.isEnabled()) {
      await window.insights.chrome.auth.getUser();
      getHosts().then((hosts) =>
        this.setState({
          allHosts: hosts.results.map((result) => result.id),
        })
      );
    }
  }

  render() {
    if (!this.isEnabled()) {
      return null;
    }

    const { allHosts } = this.state;

    const RemediationBtn = ({ dataProvider, children, ...props }) => (
      <SplitItem>
        <RemediationButton
          dataProvider={dataProvider}
          isDisabled={!allHosts || !allHosts.length}
          onRemediationCreated={this.props.onRemediationCreated}
          {...props}
        >
          {children}
        </RemediationButton>
      </SplitItem>
    );

    return (
      <React.Fragment>
        <Stack hasGutter>
          <StackItem>
            <Split hasGutter>
              {[
                'ping',
                'alwaysFail',
                'failHalfTheTime',
                'pause1m',
                'pause5m',
                'pause15m',
                'pauseRandom15m',
                'pause1h',
                'pause6h',
              ].map((name) => (
                <RemediationBtn
                  key={name}
                  dataProvider={() => ({
                    issues: [
                      {
                        id: `test:${name}`,
                        description: `Ansible ${name} test playbook`,
                      },
                    ],
                    systems: this.state.allHosts,
                  })}
                >
                  {name}
                </RemediationBtn>
              ))}
            </Split>
          </StackItem>

          <StackItem>
            <Split hasGutter>
              <RemediationBtn dataProvider={this.dataProviderA1}>
                A1
              </RemediationBtn>
              <RemediationBtn dataProvider={this.dataProviderA2}>
                A2
              </RemediationBtn>

              <RemediationBtn dataProvider={this.dataProviderC1}>
                C1
              </RemediationBtn>
              <RemediationBtn dataProvider={this.dataProviderC2}>
                C2
              </RemediationBtn>
              <RemediationBtn dataProvider={this.dataProviderC3}>
                C3
              </RemediationBtn>
              <RemediationBtn dataProvider={this.dataProviderC4}>
                C4 (multires)
              </RemediationBtn>
              <RemediationBtn dataProvider={this.dataProviderC5}>
                C5 (unsupported)
              </RemediationBtn>

              <RemediationBtn dataProvider={this.dataProviderD1}>
                D1
              </RemediationBtn>
              <RemediationBtn dataProvider={this.dataProviderD2}>
                D2
              </RemediationBtn>
            </Split>
          </StackItem>
        </Stack>
      </React.Fragment>
    );
  }
}

TestButtons.propTypes = {
  onRemediationCreated: propTypes.func,
};

TestButtons.defaultProps = {
  onRemediationCreated: (f) => f,
};

export default TestButtons;
