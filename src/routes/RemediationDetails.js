import React, { useEffect, useState, useContext } from 'react';
import { withRouter, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as actions from '../actions';
import { downloadPlaybook } from '../api';
import RemediationDetailsTable from '../components/RemediationDetailsTable';
import RemediationActivityTable from '../components/RemediationActivityTable';
import RemediationDetailsDropdown from '../components/RemediationDetailsDropdown';
import { normalizeStatus, StatusSummary } from '../components/statusHelper';
import { isBeta } from '../config';
import { ExecutePlaybookButton } from '../containers/ExecuteButtons';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import UpsellBanner from '../components/Alerts/UpsellBanner';
import ActivityTabUpsell from '../components/EmptyStates/ActivityTabUpsell';
import NotConfigured from '../components/EmptyStates/NotConfigured';
import DeniedState from '../components/DeniedState';
import classnames from 'classnames';
import SkeletonTable from '../skeletons/SkeletonTable';
import '../components/Status.scss';

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
    Flex, FlexItem,
    Tabs, Tab,
    Title
} from '@patternfly/react-core';

import RemediationDetailsSkeleton from '../skeletons/RemediationDetailsSkeleton';
import DescriptionList from '../components/Layouts/DescriptionList';
import EmptyActivityTable from '../components/EmptyStates/EmptyActivityTable';

import { PermissionContext } from '../App';

import './RemediationDetails.scss';
import NoReceptorBanner from '../components/Alerts/NoReceptorBanner';

const RemediationDetails = ({
    match,
    location,
    selectedRemediation,
    selectedRemediationStatus,
    history,
    loadRemediation,
    loadRemediationStatus,
    switchAutoReboot,
    playbookRuns,
    getPlaybookRuns
}) => {

    const id = match.params.id;
    const [ upsellBannerVisible, setUpsellBannerVisible ] = useState(localStorage.getItem('remediations:bannerStatus') !== 'dismissed');
    const [ activeTabKey, setActiveTabKey ] = useState(location.search.includes('?activity') ? 1 : 0);

    const context = useContext(PermissionContext);

    const handleRebootChange = autoReboot => {
        switchAutoReboot(id, autoReboot);
    };

    const handleUpsellToggle = () => {
        setUpsellBannerVisible(false);
        localStorage.setItem('remediations:bannerStatus', 'dismissed');
    };

    const handleTabClick = (event, tabIndex) => {
        setActiveTabKey(tabIndex);
        history.push(tabIndex === 1 ? '?activity' : '?issues');
    };

    useEffect(() => {
        loadRemediation(id).catch(e => {
            if (e && e.response && e.response.status === 404) {
                history.push('/');
                return;
            }

            throw e;
        });

        if (isBeta) {
            loadRemediationStatus(id);
        }
    }, []);

    useEffect(() => {
        getPlaybookRuns(id);
    }, [ getPlaybookRuns ]);

    useEffect(() => {
        playbookRuns;
        if (playbookRuns && playbookRuns.length && normalizeStatus(playbookRuns[0].status) === 'running') {
            const interval = setInterval(() => getPlaybookRuns(id), 10000);
            return () => {
                clearInterval(interval);
            };
        }
    }, [ playbookRuns ]);

    const generateNumRebootString = (num) => {
        return `${num} system${num === 1 ? '' : 's'} require${num === 1 ? 's' : ''} reboot`;
    };

    const generateAutoRebootStatus = (status, needsReboot) => {
        if (!needsReboot) {
            return 'Not required';
        }

        return (status ? 'Enabled' : 'Disabled');
    };

    const renderLatestActivity = (playbookRuns) => {
        if (playbookRuns.length) {
            const mostRecent = playbookRuns[0];
            return <FlexItem spacer={ { default: 'spacer-xl' } }>
                <DescriptionList
                    needsPointer
                    className='ins-c-latest-activity'
                    title='Latest activity'>
                    <StatusSummary
                        executorStatus={ mostRecent.status }
                        counts={ mostRecent.executors.reduce((acc, ex) => (
                            {
                                pending: acc.pending + ex.counts.pending,
                                running: acc.running + ex.counts.running,
                                success: acc.success + ex.counts.success,
                                failure: acc.failure + ex.counts.failure,
                                canceled: acc.canceled + ex.counts.canceled,
                                acked: acc.acked + ex.counts.acked
                            }), { pending: 0, running: 0, success: 0, failure: 0, canceled: 0, acked: 0 }) }
                        permission={ {} } />
                    <span className='ins-c-latest-activity__date'><DateFormat type='relative' date={ mostRecent.updated_at } /></span>
                    <Link to={ `/${mostRecent.remediation_id}/${mostRecent.id}` }>View</Link>
                </DescriptionList>
            </FlexItem>;
        }
    };

    const renderActivityState = (isEntitled, isReceptorConfigured, playbookRuns, remediation) => {
        if (!isReceptorConfigured) {return <NotConfigured/>;}

        if (!isEntitled) {return <ActivityTabUpsell/>;}

        if (Array.isArray(playbookRuns) && playbookRuns.length) {
            return <RemediationActivityTable remediation={ remediation } playbookRuns={ playbookRuns }/>;
        }

        if (Array.isArray(playbookRuns) && !playbookRuns.length) {
            return <EmptyActivityTable/>;
        }

        return <SkeletonTable/>;
    };

    const { status, remediation } = selectedRemediation;

    if (status !== 'fulfilled') {
        return <RemediationDetailsSkeleton/>;
    }

    const { stats } = remediation;

    const totalSystems = stats.systemsWithReboot + stats.systemsWithoutReboot;

    const pluralize = (number, str) => number === 1 ? `${number} ${str}` : `${number} ${str}s`;

    return (
        context.permissions.read === false
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
                                { context.hasSmartManagement && context.permissions.execute &&
                                    <SplitItem>
                                        <ExecutePlaybookButton
                                            isDisabled={ !context.isReceptorConfigured }
                                            remediationId={ remediation.id }>
                                        </ExecutePlaybookButton>
                                    </SplitItem>
                                }
                                <SplitItem>
                                    <Button
                                        isDisabled={ !remediation.issues.length }
                                        variant='secondary' onClick={ () => downloadPlaybook(remediation.id) }>
                                        Download playbook
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
                        { !context.hasSmartManagement && upsellBannerVisible &&
                            <StackItem>
                                <UpsellBanner onClose={ () => handleUpsellToggle() }/>
                            </StackItem>
                        }
                        { context.hasSmartManagement && !context.isReceptorConfigured &&
                            <StackItem>
                                <NoReceptorBanner/>
                            </StackItem>
                        }
                        <StackItem>
                            <Card>
                                <CardHeader className='ins-m-card__header-bold'>
                                    <Title headingLevel="h4" size="xl">Playbook summary</Title>
                                </CardHeader>
                                <CardBody>
                                    <Flex className='ins-c-playbookSummary' direction={ { default: 'column' } }>
                                        <Flex className='ins-c-playbookSummary__overview'>
                                            <FlexItem spacer={ { default: 'spacer-xl' } }>
                                                <DescriptionList
                                                    isBold
                                                    title='Total systems'>
                                                    { pluralize(totalSystems, 'system') }
                                                </DescriptionList>
                                            </FlexItem>

                                        </Flex>
                                        { playbookRuns &&
                                            renderLatestActivity(playbookRuns)
                                        }

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
                                                    spacer={ { default: 'spacer-xl' } }>
                                                    Auto reboot:&nbsp;
                                                    <b>
                                                        { generateAutoRebootStatus(
                                                            remediation.auto_reboot,
                                                            remediation.needs_reboot)
                                                        }
                                                    </b>
                                                </FlexItem>
                                                <FlexItem>{ generateNumRebootString(stats.systemsWithReboot) }</FlexItem>
                                            </Flex>
                                        </DescriptionList>
                                        { remediation.needs_reboot && context.permissions.write &&
                                            <Button
                                                variant='link'
                                                onClick={ () => handleRebootChange(!remediation.auto_reboot) }>
                                                Turn {
                                                    remediation.auto_reboot && remediation.needs_reboot ? 'off' : 'on'
                                                } auto reboot
                                            </Button>
                                        }
                                    </Flex>
                                </CardBody>
                            </Card>
                        </StackItem>
                        <StackItem className='ins-c-playbookSummary__tabs'>
                            <Tabs activeKey={ activeTabKey } onSelect={ handleTabClick }>
                                <Tab eventKey={ 0 } title='Actions'>
                                    <RemediationDetailsTable remediation={ remediation } status={ selectedRemediationStatus }/>
                                </Tab>
                                <Tab eventKey={ 1 } title='Activity'>
                                    { renderActivityState(
                                        context.hasSmartManagement,
                                        context.isReceptorConfigured,
                                        playbookRuns,
                                        remediation)
                                    }
                                </Tab>
                            </Tabs>
                        </StackItem>
                    </Stack>
                </Main>
            </React.Fragment>
    );
};

RemediationDetails.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired
        })
    }).isRequired,
    location: PropTypes.object,
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
