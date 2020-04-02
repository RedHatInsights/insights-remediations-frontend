import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as actions from '../actions';
import { downloadPlaybook } from '../api';
import RemediationDetailsTable from '../components/RemediationDetailsTable';
import RemediationActivityTable from '../components/RemediationActivityTable';
import RemediationDetailsDropdown from '../components/RemediationDetailsDropdown';
import { renderStatusIcon, normalizeStatus } from '../components/statusHelper';
import { isBeta } from '../config';
import { ExecutePlaybookButton } from '../containers/ExecuteButtons';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import UpsellBanner from '../components/Alerts/UpsellBanner';
import ActivityTabUpsell from '../components/EmptyStates/ActivityTabUpsell';
import NotConfigured from '../components/EmptyStates/NotConfigured';
import DeniedState from '../components/DeniedState';
import classnames from 'classnames';
import { capitalize } from '../Utilities/utils';

import {
    Main,
    PageHeader, PageHeaderTitle,
    DateFormat
} from '@redhat-cloud-services/frontend-components';

import {
    Card, CardHeader, CardBody,
    Stack, StackItem,
    Level, LevelItem,
    Breadcrumb, BreadcrumbItem,
    Button,
    Split, SplitItem,
    Flex, FlexItem, FlexModifiers,
    Tabs, Tab, Tooltip
} from '@patternfly/react-core';

import './RemediationDetails.scss';
import RemediationDetailsSkeleton from '../skeletons/RemediationDetailsSkeleton';
import DescriptionList from '../components/Layouts/DescriptionList';

import { PermissionContext } from '../App';
import EmptyActivityTable from '../components/EmptyStates/EmptyActivityTable';

class RemediationDetails extends Component {

    constructor (props) {
        super(props);
        this.state = {
            autoReboot: true,
            isUserEntitled: undefined,
            upsellBannerVisible: true,
            activeTabKey: 0
        };
        this.id = this.props.match.params.id;
        this.loadRemediation = this.props.loadRemediation.bind(this, this.id);
        this.loadRemediationStatus = this.props.loadRemediationStatus.bind(this, this.id);
        this.loadPlaybookRuns = this.props.getPlaybookRuns.bind(this, this.id);
    };

    handleRebootChange = autoReboot => {
        this.props.switchAutoReboot(this.id, autoReboot);
    };

    handleUpsellToggle = () => {
        this.setState({
            upsellBannerVisible: false
        });
    }

    handleTabClick = (event, tabIndex) => {
        this.setState({
            activeTabKey: tabIndex
        });
    }

    async componentDidMount () {
        this.loadRemediation().catch(e => {
            if (e && e.response && e.response.status === 404) {
                this.props.history.push('/');
                return;
            }

            throw e;
        });

        if (isBeta) {
            this.loadRemediationStatus();
        }

        const { entitlements } = await window.insights.chrome.auth.getUser();

        this.loadPlaybookRuns();

        this.setState({
            isEntitled: entitlements.smart_management.is_entitled
        });
    }

    generateNumRebootString = (num) => {
        return `${num} system${num === 1 ? '' : 's'} require${num === 1 ? 's' : ''} reboot`;
    }

    generateAutoRebootStatus = (status, needsReboot) => {
        if (!needsReboot) {
            return 'Not required';
        }

        return (status ? 'Enabled' : 'Disabled');
    }

    renderLatestActivity = (playbookRuns) => {

        if (playbookRuns.length) {

            const mostRecent = playbookRuns[0];

            return (
                <FlexItem breakpointMods={ [{ modifier: FlexModifiers['spacer-xl'] }] }>
                    <DescriptionList
                        hasGutter
                        title='Latest activity'>
                        <Tooltip content={ <span>{ capitalize(mostRecent.status) }</span> }>
                            { renderStatusIcon(normalizeStatus(mostRecent.status)) }
                        </Tooltip>
                        <span><DateFormat type='exact' date={ mostRecent.updated_at } /></span>
                        <Link to={ `/${mostRecent.remediation_id}/${mostRecent.id}` }>View</Link>
                    </DescriptionList>
                </FlexItem>
            );
        }

        return;
    }

    renderActivityState = (isEntitled, isReceptorConfigured, playbookRuns, remediation) => {
        if (!isReceptorConfigured) {return <NotConfigured/>;}

        if (!isEntitled) {return <ActivityTabUpsell/>;}

        if (playbookRuns && playbookRuns.length) {
            return <RemediationActivityTable remediation={ remediation } playbookRuns={ playbookRuns }/>;
        }

        return <EmptyActivityTable/>;
    }

    render() {
        const { status, remediation } = this.props.selectedRemediation;
        const { playbookRuns } = this.props;

        if (status !== 'fulfilled') {
            return <RemediationDetailsSkeleton/>;
        }

        const { stats } = remediation;

        const totalSystems = stats.systemsWithReboot + stats.systemsWithoutReboot;

        const pluralize = (number, str) => number === 1 ? `${number} ${str}` : `${number} ${str}s`;

        return (
            <PermissionContext.Consumer>
                { value =>
                    value.permissions.read === false
                        ? <DeniedState/>
                        :
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
                                        <PageHeaderTitle title={ remediation.name }/>
                                    </LevelItem>
                                    <LevelItem>
                                        <Split gutter="md">
                                            { this.state.isEntitled &&
                                                <PermissionContext.Consumer>
                                                    { value => value.permissions.execute &&
                                                        <SplitItem>
                                                            <ExecutePlaybookButton
                                                                isDisabled={ !value.isReceptorConfigured }
                                                                remediationId={ remediation.id }>
                                                            </ExecutePlaybookButton>
                                                        </SplitItem>
                                                    }
                                                </PermissionContext.Consumer>
                                            }
                                            <SplitItem>
                                                <Button
                                                    isDisabled={ !remediation.issues.length }
                                                    variant='link' onClick={ () => downloadPlaybook(remediation.id) }>
                                                    Download Playbook
                                                </Button>
                                            </SplitItem>
                                            <SplitItem>
                                                <RemediationDetailsDropdown remediation={ remediation } />
                                            </SplitItem>
                                        </Split>
                                    </LevelItem>
                                </Level>
                            </PageHeader>
                            <Main>
                                <Stack gutter="md">
                                    { this.state.isEntitled === false && this.state.upsellBannerVisible &&
                                        <StackItem>
                                            <UpsellBanner onClose={ this.handleUpsellToggle }/>
                                        </StackItem>
                                    }
                                    <StackItem>
                                        <Card>
                                            <CardHeader className='ins-m-card__header-bold'>Playbook Summary</CardHeader>
                                            <CardBody>
                                                <Flex className='ins-c-playbookSummary' breakpointMods={ [{ modifier: FlexModifiers.column }] }>
                                                    <Flex className='ins-c-playbookSummary__overview'>
                                                        <FlexItem breakpointMods={ [{ modifier: FlexModifiers['spacer-xl'] }] }>
                                                            <DescriptionList
                                                                isBold
                                                                title='Total systems'>
                                                                { pluralize(totalSystems, 'system') }
                                                            </DescriptionList>
                                                        </FlexItem>
                                                        { playbookRuns &&
                                                            this.renderLatestActivity(playbookRuns)
                                                        }
                                                    </Flex>
                                                    <DescriptionList className='ins-c-playbookSummary__settings' title='Playbook settings'>
                                                        <Flex>
                                                            <FlexItem
                                                                className={ classnames(
                                                                    'ins-c-reboot-status',
                                                                    { 'ins-c-reboot-status__enabled':
                                                                        remediation.auto_reboot && remediation.needs_reboot
                                                                    },
                                                                    { 'ins-c-reboot-status__disabled': !remediation.auto_reboot }
                                                                ) }
                                                                breakpointMods={ [{ modifier: FlexModifiers['spacer-xl'] }] }>
                                                                Autoreboot:&nbsp;
                                                                <b>
                                                                    { this.generateAutoRebootStatus(
                                                                        remediation.auto_reboot,
                                                                        remediation.needs_reboot)
                                                                    }
                                                                </b>
                                                            </FlexItem>
                                                            <FlexItem>{ this.generateNumRebootString(stats.systemsWithReboot) }</FlexItem>
                                                        </Flex>
                                                    </DescriptionList>
                                                    { remediation.needs_reboot &&
                                                        <PermissionContext.Consumer>
                                                            { value => value.permissions.write &&
                                                                <Button
                                                                    variant='link'
                                                                    onClick={ () => this.handleRebootChange(!remediation.auto_reboot) }>
                                                                    Turn {
                                                                        remediation.auto_reboot && remediation.needs_reboot ? 'off' : 'on'
                                                                    } auto reboot
                                                                </Button>
                                                            }
                                                        </PermissionContext.Consumer>
                                                    }
                                                </Flex>
                                            </CardBody>
                                        </Card>
                                    </StackItem>
                                    <StackItem className='ins-c-playbookSummary__tabs'>
                                        <Tabs activeKey={ this.state.activeTabKey } onSelect={ this.handleTabClick }>
                                            <Tab eventKey={ 0 } title='Issues'>
                                                <RemediationDetailsTable remediation={ remediation } status={ this.props.selectedRemediationStatus }/>
                                            </Tab>
                                            <Tab eventKey={ 1 } title='Activity'>
                                                <PermissionContext.Consumer>
                                                    { value =>
                                                        this.renderActivityState(
                                                            this.state.isEntitled,
                                                            value.isReceptorConfigured,
                                                            playbookRuns,
                                                            remediation)
                                                    }
                                                </PermissionContext.Consumer>
                                            </Tab>
                                        </Tabs>
                                    </StackItem>
                                </Stack>
                            </Main>
                        </React.Fragment>
                }
            </PermissionContext.Consumer>
        );
    }
}

RemediationDetails.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired
        })
    }).isRequired,
    selectedRemediation: PropTypes.object,
    selectedRemediationStatus: PropTypes.object,
    history: PropTypes.object.isRequired,
    loadRemediation: PropTypes.func.isRequired,
    loadRemediationStatus: PropTypes.func.isRequired,
    switchAutoReboot: PropTypes.func.isRequired,
    deleteRemediation: PropTypes.func.isRequired,
    executePlaybookBanner: PropTypes.shape({
        isVisible: PropTypes.bool
    }),
    addNotification: PropTypes.func.isRequired,
    playbookRuns: PropTypes.array,
    getPlaybookRuns: PropTypes.func
};

export default withRouter(
    connect(
        ({ selectedRemediation, selectedRemediationStatus, executePlaybookBanner, playbookRuns }) => ({
            selectedRemediation,
            selectedRemediationStatus,
            executePlaybookBanner,
            playbookRuns: playbookRuns.data,
            remediation: selectedRemediation.remediation
        }),
        dispatch => ({
            loadRemediation: id => dispatch(actions.loadRemediation(id)),
            loadRemediationStatus: id => dispatch(actions.loadRemediationStatus(id)),
            // eslint-disable-next-line camelcase
            switchAutoReboot: (id, auto_reboot) => dispatch(actions.patchRemediation(id, { auto_reboot })),
            deleteRemediation: id => dispatch(actions.deleteRemediation(id)),
            addNotification: (content) => dispatch(addNotification(content)),
            getPlaybookRuns: (id) => dispatch(actions.getPlaybookRuns(id))
        })
    )(RemediationDetails)
);
