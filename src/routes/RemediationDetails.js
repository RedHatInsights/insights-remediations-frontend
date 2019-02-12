import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { formatUser } from '../Utilities/model';
import * as actions from '../actions';
import { downloadPlaybook } from '../api';
import RemediationDetailsTable from '../components/RemediationDetailsTable';
import { DeleteRemediationButton } from '../containers/DeleteButtons';
import { isBeta } from '../config';
import ActionsResolvedCard from '../components/ActionsResolvedCard';

import {
    Main,
    PageHeader, PageHeaderTitle
} from '@red-hat-insights/insights-frontend-components';

import {
    Grid, GridItem,
    Card, CardHeader, CardBody,
    Stack, StackItem,
    Switch,
    Level, LevelItem,
    Breadcrumb, BreadcrumbItem,
    Button,
    Split, SplitItem
} from '@patternfly/react-core';

import './RemediationDetails.scss';
import RemediationDetailsSkeleton from '../skeletons/RemediationDetailsSkeleton';

class RemediationDetails extends Component {

    constructor (props) {
        super(props);
        this.state = {
            autoReboot: true
        };
        this.id = this.props.computedMatch.params.id;
        this.loadRemediation = this.props.loadRemediation.bind(this, this.id);
        this.loadRemediationStatus = this.props.loadRemediationStatus.bind(this, this.id);
    };

    handleRebootChange = autoReboot => {
        this.props.switchAutoReboot(this.id, autoReboot);
    };

    async componentDidMount () {
        await window.insights.chrome.auth.getUser();
        await Promise.all([
            this.loadRemediation(),
            this.loadRemediationStatus()
        ]);
    }

    render() {
        const { status, remediation } = this.props.selectedRemediation;

        if (status !== 'fulfilled') {
            return <RemediationDetailsSkeleton/>;
        }

        const { stats } = remediation;

        return (
            <React.Fragment>
                <PageHeader>
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to='/'> Remediations </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem isActive> { remediation.name } </BreadcrumbItem>
                    </Breadcrumb>
                    <Level className="ins-c-level">
                        <LevelItem>
                            <PageHeaderTitle title={ `Playbook: ${ remediation.name }` }/>
                        </LevelItem>
                        <LevelItem>
                            <Split gutter="md">
                                <SplitItem>
                                    <Button
                                        isDisabled={ !remediation.issues.length }
                                        variant='link'onClick={ () => downloadPlaybook(remediation.id) }>
                                        Download Playbook
                                    </Button>
                                </SplitItem>
                                <SplitItem><DeleteRemediationButton remediation={ remediation }/></SplitItem>
                            </Split>
                        </LevelItem>
                    </Level>
                </PageHeader>
                <Main>
                    <Stack gutter="md">
                        <StackItem>
                            <Grid gutter="md" sm={ 12 } md={ isBeta ? 4 : 6 } className='ins-c-summary-cards'>
                                {
                                    isBeta &&
                                    <GridItem>
                                        <ActionsResolvedCard status={ this.props.selectedRemediationStatus } />
                                    </GridItem>
                                }
                                <GridItem>
                                    <Card className='ins-c-card__system-reboot'>
                                        <CardHeader className='ins-m-card__header-bold'> Systems Reboot </CardHeader>
                                        <CardBody>
                                            <Grid gutter="md" md={ 4 } sm={ 4 }>
                                                <GridItem>
                                                    <Stack>
                                                        <StackItem className='ins-m-text-emphesis'>{ stats.systemsWithoutReboot }</StackItem>
                                                        <StackItem>No reboot</StackItem>
                                                    </Stack>
                                                </GridItem>
                                                <GridItem>
                                                    <Stack>
                                                        <StackItem className='ins-m-text-emphesis'>{ stats.systemsWithReboot }</StackItem>
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
                                                    Playbook Details
                                                </LevelItem>
                                                <LevelItem className='ins-c-subheader-small'>
                                                    Created: { moment(remediation.created_at).format('lll') }
                                                </LevelItem>
                                            </Level>
                                        </CardHeader>
                                        <CardBody>
                                            <Stack>
                                                <StackItem>Created By: { formatUser(remediation.created_by) }</StackItem>
                                                <StackItem>Last Modified By: { formatUser(remediation.updated_by) }</StackItem>
                                                <StackItem>Last Modified On: { moment(remediation.updated_at).format('lll') }</StackItem>
                                                {
                                                    isBeta &&
                                                    <StackItem className='ins-m-border-top'> Shared with: unknown </StackItem>
                                                }
                                            </Stack>
                                        </CardBody>
                                    </Card>
                                </GridItem>
                            </Grid>
                        </StackItem>
                        <StackItem>
                            <RemediationDetailsTable remediation={ remediation } status={ this.props.selectedRemediationStatus }/>
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
    selectedRemediation: PropTypes.object,
    selectedRemediationStatus: PropTypes.object,
    history: PropTypes.object.isRequired,
    loadRemediation: PropTypes.func.isRequired,
    loadRemediationStatus: PropTypes.func.isRequired,
    switchAutoReboot: PropTypes.func.isRequired,
    deleteRemediation: PropTypes.func.isRequired
};

export default withRouter(
    connect(
        ({ selectedRemediation, selectedRemediationStatus }) => ({ selectedRemediation, selectedRemediationStatus }),
        dispatch => ({
            loadRemediation: id => dispatch(actions.loadRemediation(id)),
            loadRemediationStatus: id => dispatch(actions.loadRemediationStatus(id)),
            // eslint-disable-next-line camelcase
            switchAutoReboot: (id, auto_reboot) => dispatch(actions.patchRemediation(id, { auto_reboot })),
            deleteRemediation: id => dispatch(actions.deleteRemediation(id))
        })
    )(RemediationDetails)
);
