import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import asyncComponent from '../Utilities/asyncComponent';
import * as actions from '../actions';

import {
    Main,
    PageHeader, PageHeaderTitle
} from '@red-hat-insights/insights-frontend-components';

import {
    Grid, GridItem,
    Card, CardHeader, CardBody,
    Progress, ProgressMeasureLocation,
    Stack, StackItem,
    Switch,
    Level, LevelItem,
    Breadcrumb, BreadcrumbItem,
    Button
} from '@patternfly/react-core';

const RemediationDetailsTable = asyncComponent(() => import('../components/RemediationDetailsTable'));
import './RemediationDetails.scss';

class RemediationDetails extends Component {

    constructor (props) {
        super(props);
        this.props = props;
        this.state = {
            autoReboot: true
        };
        this.id = this.props.computedMatch.params.id;
        this.loadRemediation = this.props.loadRemediation.bind(this, this.id);
    };
    handleRebootChange = autoReboot => {
        this.props.switchAutoReboot(this.id, autoReboot);
    };

    async componentDidMount () {
        await window.insights.chrome.auth.getUser();
        await this.loadRemediation();
    }

    render() {
        const { status, remediation } = this.props;

        if (status !== 'fulfilled') {
            return <div>Loading</div>;
        }

        return (
            <React.Fragment>
                <PageHeader>
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to='/'> Home </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem isActive> { remediation.name } </BreadcrumbItem>
                    </Breadcrumb>
                    <Level>
                        <LevelItem>
                            <PageHeaderTitle title={ `Plan: ${ remediation.name }` }/>
                        </LevelItem>
                        <LevelItem>
                            <Button> Generate Playbook </Button>
                        </LevelItem>
                    </Level>
                </PageHeader>
                <Main>
                    <Stack gutter="md">
                        <StackItem>
                            <Grid gutter="md" sm={ 12 } md={ 4 } className='ins-c-summary-cards'>
                                <GridItem>
                                    <Card className='ins-c-card__actions-resolved'>
                                        <CardHeader>
                                            <Level>
                                                <LevelItem className='ins-m-card__header-bold'>
                                                    Actions Resolved
                                                </LevelItem>
                                                <LevelItem className='ins-c-subheader-small'>
                                                    Updated on: { remediation.updated_at }
                                                </LevelItem>
                                            </Level>
                                        </CardHeader>
                                        <CardBody>
                                            <Progress
                                                value={ 19 }
                                                label='16 of 62'
                                                measureLocation={ ProgressMeasureLocation.outside } />
                                        </CardBody>
                                    </Card>
                                </GridItem>
                                <GridItem>
                                    <Card className='ins-c-card__system-reboot'>
                                        <CardHeader className='ins-m-card__header-bold'> Systems Reboot </CardHeader>
                                        <CardBody>
                                            <Grid gutter="md" md={ 4 } sm={ 4 }>
                                                <GridItem>
                                                    <Stack>
                                                        <StackItem className='ins-m-text-emphesis'>11</StackItem>
                                                        <StackItem>No reboot</StackItem>
                                                    </Stack>
                                                </GridItem>
                                                <GridItem>
                                                    <Stack>
                                                        <StackItem className='ins-m-text-emphesis'>2</StackItem>
                                                        <StackItem>Reboot Required</StackItem>
                                                    </Stack>
                                                </GridItem>
                                                <GridItem>
                                                    <Stack>
                                                        <StackItem className='ins-c-reboot-switch'>
                                                            <Switch
                                                                id="autoReboot"
                                                                aria-label="Auto Reboot"
                                                                isChecked={ remediation.needs_reboot ? remediation.auto_reboot : false }
                                                                isDisabled={ !remediation.needs_reboot }
                                                                onChange={ this.handleRebootChange }
                                                            />
                                                        </StackItem>
                                                        <StackItem>Auto Reboot</StackItem>
                                                    </Stack>
                                                </GridItem>
                                            </Grid>
                                        </CardBody>
                                    </Card>
                                </GridItem>
                                <GridItem>
                                    <Card className='ins-c-card__plan-details'>
                                        <CardHeader>
                                            <Level>
                                                <LevelItem className='ins-m-card__header-bold'>
                                                    Plan Details
                                                </LevelItem>
                                                <LevelItem className='ins-c-subheader-small'>
                                                    Last Updated: { moment(remediation.updated_at).format('lll') }
                                                </LevelItem>
                                            </Level>
                                        </CardHeader>
                                        <CardBody>
                                            <Stack>
                                                <StackItem>Created By: { remediation.created_by }</StackItem>
                                                <StackItem>Date: { moment(remediation.created_at).format('lll') }</StackItem>
                                                <StackItem> Shared with: fix </StackItem>
                                            </Stack>
                                        </CardBody>
                                    </Card>
                                </GridItem>
                            </Grid>
                        </StackItem>
                        <StackItem>
                            <RemediationDetailsTable remediation={ remediation }/>
                        </StackItem>
                    </Stack>
                </Main>
            </React.Fragment>
        );
    }
}

RemediationDetails.propTypes = {
    computedMatch: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired
        })
    }),
    status: PropTypes.string.isRequired,
    remediation: PropTypes.object,
    loadRemediation: PropTypes.func.isRequired,
    switchAutoReboot: PropTypes.func.isRequired
};

export default withRouter(
    connect(
        ({ selectedRemediation }) => ({ ...selectedRemediation }),
        dispatch => ({
            loadRemediation: id => dispatch(actions.loadRemediation(id)),
            // eslint-disable-next-line camelcase
            switchAutoReboot: (id, auto_reboot) => dispatch(actions.patchRemediation(id, { auto_reboot }))
        })
    )(RemediationDetails)
);
