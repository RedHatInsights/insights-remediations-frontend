/* eslint-disable */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { withRouter } from 'react-router-dom';
import './FindItFixIt.scss';
import Controller from './logic.js';

import yaml from 'js-yaml'

import { Main, PageHeader, PageHeaderTitle } from '@red-hat-insights/insights-frontend-components';
import { DownloadIcon,
         ExclamationCircleIcon,
         CircleIcon,
         CubesIcon,
         AngleDoubleUpIcon } from '@patternfly/react-icons';
import {
    Alert,
    AlertActionCloseButton,
    Button,
    Card,
    CardBody,
    CardHeader,
    DataList,
    DataListItem,
    DataListCell,
    Modal,
    Grid,
    GridItem,
    EmptyState,
    EmptyStateIcon,
    EmptyStateBody,
		Title,
    Tooltip
} from '@patternfly/react-core';

class FindItFixIt extends Component {
    constructor(props) {
        super(props);
        this.state = {
            alertDangerVisible: false,
            alertSuccessVisible: false,
          isModalOpen: false
        };
        this.controller = new Controller(this);
        window.controller = this.controller;

        this.handleModalToggle = this.handleModalToggle.bind(this);
        this.handleBackToTop = this.handleBackToTop.bind(this);
        this.hideDangerAlert = this.hideDangerAlert.bind(this);
        this.hideSuccessAlert = this.hideSuccessAlert.bind(this);
    }

    hideDangerAlert () {
        this.setState({ alertDangerVisible: false });
    }
    hideSuccessAlert () {
        this.setState({ alertSuccessVisible: false });
    }

    handleBackToTop(e) {
        ReactDOM.findDOMNode(this).scrollIntoView({behavior: "smooth"});
    }

    handleModalToggle () {
        this.setState({
            isModalOpen: !this.state.isModalOpen
        });
    };
    shouldComponentUpdate (nextProps, nextState) {
        return true;
    }
    componentDidMount() {
        this.controller.init();
    }

    render() {
        const {
            alertDangerVisible,
            alertSuccessVisible,
            isModalOpen
        } = this.state;

        const dataListCellStyle = {
            color: '#aeaeae',
            fontStyle: 'italic'
        };

        var hosts = [];
        for (var i = 0; i < this.controller.hosts.length; i++) {
            var host = this.controller.hosts[i];
            var tasks = this.controller.tasks_by_host[host.host_id];
            console.log(['tasks', tasks]);
            if (tasks === undefined) {
                continue;
            }
            if (tasks.length === 0) {
                continue;
            }
            var last_task = tasks.slice(-1)[0];
            console.log(last_task);
            hosts.push(<DataListItem aria-labelledby="simple-item1" key={host.name}>
                        <DataListCell>
                            <h3>
                            {last_task.status == 'ok' ?
                            <Tooltip
                                position="left"
                                content={<p>Successful</p>} >
                            <CircleIcon size="sm" style={{ color: '#52af51', marginRight: '5px' }}/>
                            </Tooltip>
                            :
                            <Tooltip
                                position="left"
                                content={<p>Failed</p>} >
                            <CircleIcon size="sm" style={{ color: '#d44946', marginRight: '5px' }}/>
                            </Tooltip>
                            }
                            {host.name}</h3>
                        </DataListCell>
                        <DataListCell style={ dataListCellStyle }>
                            <h3>{last_task.name}</h3>
                        </DataListCell>
                    </DataListItem>);
        }

        var plays = []

        for (var i=0; i < this.controller.plays.length; i++) {
          plays.push(<li>{this.controller.plays[i]}</li>);
        }

        return (
            <React.Fragment>
                <PageHeader>
                    <PageHeaderTitle title='Find It, Fix It'/>
                </PageHeader>
                {alertDangerVisible && (
                    <Alert
                        variant="danger"
                        title="Cannot reach API"
                        action={<AlertActionCloseButton onClose={this.hideDangerAlert} />}
                    />
                )}
                {alertSuccessVisible && (
                    <Alert
                        variant="success"
                        title="Playbook completed"
                        action={<AlertActionCloseButton onClose={this.hideSuccessAlert} />}
                    />
                )}
                <Main>
                    <div className="runDetails" style={{ display: 'flex' }}>
                        <Card>
                            <CardHeader>Details</CardHeader>
                            { this.controller.playbook.name ?
                                <CardBody>
                                    <Grid gutter="md">
                                        <GridItem span={3}><b>Title</b></GridItem>
                                        <GridItem span={9}>{this.controller.playbook.name}</GridItem>
                                        <GridItem span={3}><b>Playbook</b></GridItem>
                                        <GridItem span={9}>
                                        <span style={{ color: '#007bba', cursor: 'pointer' }} onClick={this.handleModalToggle}>View playbook</span>
                                        </GridItem>
                                        <GridItem span={3}><b>Plays</b></GridItem>
                                        <GridItem span={9}>
                                        <ul>
                                        {plays}
                                        </ul>
                                        </GridItem>
                                    </Grid>
                                </CardBody>
                            :
                            <EmptyState>
                                <EmptyStateIcon icon={CubesIcon} />
                                <EmptyStateBody>Playbook details will appear here soon.</EmptyStateBody>
                            </EmptyState> }
                        </Card>
                        <Card className="taskCard" style={{ maxHeight: '500px' }}>
                            <CardHeader>Tasks</CardHeader>
                                {hosts.length > 0 ?
                                    <CardBody style={{ maxHeight: '100%', overflowY: 'auto'}}>
                                        <DataList aria-label="Simple data list example">
                                            <DataListItem aria-labelledby="simple-item1" style={{ marginBottom: '8px' }}>
                                                <DataListCell>
                                                    <h3><b>Host</b></h3>
                                                </DataListCell>
                                                <DataListCell>
                                                    <h3><b>Activity</b></h3>
                                                </DataListCell>
                                            </DataListItem>
                                            {hosts}
                                        </DataList>
                                    </CardBody>
                                :
                                    <EmptyState>
                                      <EmptyStateIcon icon={CubesIcon} />
                                      <EmptyStateBody>Host activity will appear here as Ansible executes the playbook. </EmptyStateBody>
                                    </EmptyState>}
                            </Card>
                        </div>
                    <Card className="logCard">
                        <CardHeader style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h1>Log</h1>
                            <Tooltip
                                position="left"
                                content={<p>Download Log</p>} >
                                <Button className="downloadIcon" variant="tertiary" aria-label="Action">
                                    <DownloadIcon size="sm"/>
                                </Button>
                            </Tooltip>
                        </CardHeader>
                        { this.controller.log.length > 0  ?
                        <CardBody style={{ paddingTop: '20px'}}>
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <pre style={{fontFamily: 'monospace',
                                     backgroundColor: '#e8e8e8',
                                     padding: '10px',
                                     textAlign: 'right',
                                     border: '1px solid #b7b7b7',
                                     borderRight: '0px'}}>{[...Array(this.controller.log.map(function (d) {return d.value;}).join('\n').split('\n').length+2).keys()].slice(1).join('\n')}</pre>
                        <pre style={{fontFamily: 'monospace',
                                     backgroundColor: '#f6f6f6',
                                     padding: '10px',
                                     flex: '1',
                                     border: '1px solid #b7b7b7',
                                     marginTop: '0px',
                                     whiteSpace: 'pre'}}>{this.controller.log.map(function (d) {return d.value;}).join('\n')}
                        <div  style={{/*paddingTop: "10px",*/ textAlign: "right"}}>
                        <span className="backToTop" onClick={this.handleBackToTop} style={{textDecoration: "none"}}> <AngleDoubleUpIcon size="sm"/> BACK TO TOP</span>
                        </div>
                        </pre>

                        </div>
                        </CardBody>
                        :
                        <EmptyState>
                        <EmptyStateIcon icon={CubesIcon} />
                        <EmptyStateBody>Ansible playbook run log will appear here as Ansible executes the playbook. </EmptyStateBody>
                        </EmptyState>}
                    </Card>
                    <Modal
                        title={this.controller.playbook.name}
                        isOpen={isModalOpen}
                        onClose={this.handleModalToggle}
                        actions={[
                            <Button key="cancel" variant="secondary" onClick={this.handleModalToggle}>Close</Button>
                        ]}>
                        <Card className="playBookCard">

                        <CardBody style={{padding: '0px'}}>
                        <div style={{display: 'flex', justifyContent: 'flex-start'}}>
                        <pre style={{fontFamily: 'monospace',
                                     backgroundColor: '#e8e8e8',
                                     padding: '10px',
                                     border: '1px solid #b7b7b7',
                                     textAlign: 'right',
                                     borderRight: '0px'}}>{[...Array(this.controller.playbook.contents.split('\n').length+1).keys()].slice(1).join('\n')}</pre>
                        <pre className="playbookDisplay" 
                                     style={{fontFamily: 'monospace',
                                     backgroundColor: '#f6f6f6',
                                     padding: '10px',
                                     flex: '1',
                                     border: '1px solid #b7b7b7',
                                     marginTop: '0px',
                                     whiteSpace: 'pre'}}>{controller.playbook.contents.split('\n').map(function(x) {return x.length >= 120 ? x.slice(0, 117) + '...' : x;}).join('\n')}</pre>
                               </div>
                        </CardBody>
                        </Card>
                    </Modal>
                </Main>
            </React.Fragment>
        );
    }
}

export default withRouter(FindItFixIt);
