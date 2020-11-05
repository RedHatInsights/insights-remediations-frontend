import React, { useEffect, useState, useContext } from 'react';
import { withRouter, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as actions from '../actions';
import { downloadPlaybook } from '../api';
import RemediationDetailsTable from '../components/RemediationDetailsTable';
import RemediationActivityTable from '../components/RemediationActivityTable';
import RemediationDetailsDropdown from '../components/RemediationDetailsDropdown';
import { normalizeStatus } from '../components/statusHelper';
import { isBeta } from '../config';
import { ExecutePlaybookButton } from '../containers/ExecuteButtons';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import UpsellBanner from '../components/Alerts/UpsellBanner';
import ActivityTabUpsell from '../components/EmptyStates/ActivityTabUpsell';
import NotConfigured from '../components/EmptyStates/NotConfigured';
import DeniedState from '../components/DeniedState';
import SkeletonTable from '../skeletons/SkeletonTable';
import '../components/Status.scss';

import {
    Main, PageHeader, PageHeaderTitle
} from '@redhat-cloud-services/frontend-components';

import {
    Stack, StackItem,
    Level, LevelItem,
    Breadcrumb, BreadcrumbItem,
    Button,
    Split, SplitItem,
    Tabs, Tab
} from '@patternfly/react-core';

import RemediationDetailsSkeleton from '../skeletons/RemediationDetailsSkeleton';
import EmptyActivityTable from '../components/EmptyStates/EmptyActivityTable';

import { PermissionContext } from '../App';

import './RemediationDetails.scss';
import NoReceptorBanner from '../components/Alerts/NoReceptorBanner';
import { RemediationSummary } from '../components/RemediationSummary';

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
    const [ upsellBannerVisible, setUpsellBannerVisible ] = useState(
        localStorage.getItem('remediations:bannerStatus') !== 'dismissed'
    );
    const [ noReceptorBannerVisible, setNoReceptorBannerVisible ] = useState(
        localStorage.getItem('remediations:receptorBannerStatus') !== 'dismissed'
    );
    const [ activeTabKey, setActiveTabKey ] = useState(location.search.includes('?activity') ? 1 : 0);

    const context = useContext(PermissionContext);

    const handleUpsellToggle = () => {
        setUpsellBannerVisible(false);
        localStorage.setItem('remediations:bannerStatus', 'dismissed');
    };

    const handleNoReceptorToggle = () => {
        setNoReceptorBannerVisible(false);
        localStorage.setItem('remediations:receptorBannerStatus', 'dismissed');
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

    if (remediation) {
        document.title = `${ remediation.name } | Remediations | Red Hat Insights`;
    }

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
                            <Split hasGutter>
                                { context.hasSmartManagement &&
                                    <SplitItem>
                                        <ExecutePlaybookButton
                                            isDisabled={ !context.isReceptorConfigured || !context.permissions.execute }
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
                    <RemediationSummary
                        remediation={ remediation }
                        playbookRuns={ playbookRuns }
                        switchAutoReboot={ switchAutoReboot }
                        context={ context }
                    />
                </PageHeader>
                <Main>
                    <Stack hasGutter>
                        { !context.hasSmartManagement && upsellBannerVisible &&
                            <StackItem>
                                <UpsellBanner onClose={ () => handleUpsellToggle() }/>
                            </StackItem>
                        }
                        { context.hasSmartManagement && !context.isReceptorConfigured && noReceptorBannerVisible &&
                            <StackItem>
                                <NoReceptorBanner onClose={ () => handleNoReceptorToggle() }/>
                            </StackItem>
                        }
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
