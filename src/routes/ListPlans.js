import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';

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
    Level, LevelItem
} from '@patternfly/react-core';

import './ListPlans.scss';

class ListPlans extends Component {

    constructor (props) {
        super(props);
        this.props = props;
        this.state = {
            autoReboot: true
        };

        this.loadRemediation = this.props.loadRemediation.bind(this, this.props.computedMatch.params.id);
    };

    handleRebootChange = autoReboot => {
        this.setState({ autoReboot });
    };

    async componentDidMount () {
        await window.insights.chrome.auth.getUser();
        await this.loadRemediation();
    }

    render() {
        const { status, remediation } = this.props;

        const { autoReboot } = this.state;

        if (status !== 'fulfilled') {
            return <div>Loading</div>;
        }

        return (
            <React.Fragment>
                <PageHeader>
                    <PageHeaderTitle title={ `Plan: ${ remediation.name || '' }` }/>
                </PageHeader>
                <Main>
                    <Grid gutter="md" sm={ 12 } md={ 4 } className='ins-c-summary-cards'>
                        <GridItem>
                            <Card className='ins-c-card__actions-resolved'>
                                <CardHeader>
                                    <Level>
                                        <LevelItem>
                                            Actions Resolved
                                        </LevelItem>
                                        <LevelItem className='ins-c-action__update-date'>
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
                                <CardHeader> Systems Reboot </CardHeader>
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
                                                <StackItem>
                                                    <Switch
                                                        id="autoReboot"
                                                        aria-label="Auto Reboot"
                                                        isChecked={ autoReboot }
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
                                <CardHeader> Plan Details </CardHeader>
                                <CardBody>
                                    <Stack>
                                        <StackItem>Created By: { remediation.owner }</StackItem>
                                        <StackItem>Date: { moment(remediation.created_at).format('ll') }</StackItem>
                                        <StackItem> Shared with: foo</StackItem>
                                    </Stack>
                                </CardBody>
                            </Card>
                        </GridItem>
                    </Grid>
                </Main>
            </React.Fragment>
        );
    }
}

ListPlans.propTypes = {
    computedMatch: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired
        })
    }),
    status: PropTypes.string.isRequired,
    remediation: PropTypes.object,
    loadRemediation: PropTypes.func.isRequired
};

export default withRouter(
    connect(
        ({ selectedRemediation }) => ({ ...selectedRemediation }),
        dispatch => ({
            loadRemediation: id => dispatch(actions.loadRemediation(id))
        })
    )(ListPlans)
);
