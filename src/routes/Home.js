import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector as reduxSelector } from 'react-redux';
import { StackItem, Stack } from '@patternfly/react-core';

import * as actions from '../actions';
import { downloadPlaybook } from '../api';

import { Main, PageHeader, PageHeaderTitle, PrimaryToolbar, Wizard } from '@redhat-cloud-services/frontend-components';
import RemediationTable from '../components/RemediationTable';
import TestButtons from '../components/TestButtons';

import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';

// Wizard Steps
import PlanName from '../components/CreatePlanModal/ModalSteps/PlanName';
import PlanSystems from '../components/CreatePlanModal/ModalSteps/PlanSystems';

import './Home.scss';

import { PermissionContext } from '../App';
import DeniedState from '../components/DeniedState';
import NoReceptorBanner from '../components/Alerts/NoReceptorBanner';
import { useFilter, usePagination, useSelector, useSorter } from '../hooks/table';
import ConfirmationDialog from '../components/ConfirmationDialog';
import keyBy from 'lodash/keyBy';

function downloadAll (selectedIds, data) {
    const byId = keyBy(data, r => r.id);
    selectedIds.reduce((result, id) => {
        const remediation = byId[id];

        if (remediation && remediation.issue_count === 0) {
            return result;
        }

        return result.then(() => downloadPlaybook(id));
    }, Promise.resolve());
}

const SORTING_ITERATEES = [ null, 'name', 'system_count', 'issue_count', 'updated_at' ];

function Home () {

    const [ isModalOpen, setIsModalOpen ] = useState(false);
    const [ noReceptorBannerVisible, setNoReceptorBannerVisible ] = useState(
        localStorage.getItem('remediations:receptorBannerStatus') !== 'dismissed');
    const sorter = useSorter(4, 'desc');
    const filter = useFilter();
    const selector = useSelector();
    const pagination = usePagination();
    const [ remediationCount, setRemediationCount ] = useState(0);
    const [ filterText, setFilterText ] = useState('');
    const [ dialogOpen, setDialogOpen ] = useState(false);
    const [ showArchived, setShowArchived ] = useState(
        false || localStorage.getItem('remediations:showArchived') === 'true');
    const [ shouldUpdateGrid, setShouldUpdateGrid ] = useState(false);
    const remediations = reduxSelector(state => state.remediations);
    const dispatch = useDispatch();
    const loadRemediations = (...args) => dispatch(actions.loadRemediations(...args));
    const deleteRemediation = (id) => dispatch(actions.deleteRemediation(id));

    function load () {
        const column = SORTING_ITERATEES[sorter.sortBy];
        loadRemediations(column, sorter.sortDir, filter.value, pagination.pageSize, pagination.offset, showArchived);
    }

    useEffect(load, []);

    useEffect(() => {
        if (remediations.status === 'fulfilled' && filter.value === filterText) {
            setShouldUpdateGrid(true);
        }
    }, [ sorter.sortBy, sorter.sortDir, filter.value, pagination.pageSize, pagination.pageDebounced ]);

    useEffect(() => {
        filter.setValue(filterText);
    }, [ filterText ]);

    filter.onChange(pagination.reset);
    sorter.onChange(pagination.reset);

    const selectedIds = selector.getSelectedIds();

    const handleNoReceptorToggle = () => {
        setNoReceptorBannerVisible(false);
        localStorage.setItem('remediations:receptorBannerStatus', 'dismissed');
    };

    const sendNotification = (data) => {
        dispatch(addNotification(data));
    };

    // const openModal = () => setIsModalOpen(true);

    const onClose = (submitted) => {
        setIsModalOpen(false);

        if (submitted) {
            sendNotification({
                variant: 'success',
                title: 'Wizard completed',
                description: 'Congratulations! You successfully clicked through the temporary wizard placeholder!'
            });
        }
    };

    const onRemediationCreated = (result) => {
        sendNotification(result.getNotification());
        dispatch(actions.loadRemediations());
    };

    // Wizard Content
    const ModalStepContent = [
        <PlanName key='PlanName'/>,
        <PlanSystems key='PlanSystems'/>
    ];

    const activeFiltersConfig = {
        filters: filterText.length ? [{ category: 'Name', chips: [{ name: filterText }]}] : [],
        onDelete: () => {setFilterText(''); filter.setValue('');}
    };

    return (
        <PermissionContext.Consumer>
            { permission =>
                permission.permissions.read === false
                    ? <DeniedState/>
                    : <React.Fragment>
                        <PageHeader>
                            <PageHeaderTitle title='Remediations'/>
                            <TestButtons onRemediationCreated={ onRemediationCreated } />
                        </PageHeader>
                        <PrimaryToolbar
                            filterConfig={ {
                                items: [{
                                    label: 'Search playbooks',
                                    type: 'text',
                                    filterValues: {
                                        id: 'filter-by-string',
                                        key: 'filter-by-string',
                                        placeholder: 'Search playbooks',
                                        value: filterText,
                                        onChange: (_e, value) => {
                                            setFilterText(value);
                                        }
                                    }
                                }]
                            } }
                            bulkSelect={ { items: [{ title: 'Select all',
                                onClick: (e) => selector.props.onSelect(e, true, -1)
                            }],
                            checked: selectedIds.length && remediationCount > selectedIds.length ? null : selectedIds.length,
                            count: selectedIds.length,
                            onSelect: (isSelected, e) => selector.props.onSelect(e, isSelected, -1) } }
                            actionsConfig={ { actions: [
                                { label: 'Download playbooks',
                                    props: { variant: 'secondary', isDisabled: !selectedIds.length },
                                    onClick: () => downloadAll(selectedIds, remediations.value.data) // TODO state for downloads?
                                },
                                { label: 'Delete playbooks',
                                    props: { isDisabled: !permission.permissions.write || !selectedIds.length },
                                    onClick: () => setDialogOpen(true)
                                },
                                { label: showArchived ? 'Hide archived playbooks' : 'Show archived playbooks',
                                    onClick: showArchived ?
                                        () => {
                                            setShowArchived(false);
                                            selector.reset();
                                            localStorage.setItem('remediations:showArchived', 'false');
                                        } :
                                        () => {
                                            setShowArchived(true);
                                            selector.reset();
                                            localStorage.setItem('remediations:showArchived', 'true');
                                        }
                                }]} }
                            pagination={ { ...pagination.props, itemCount: remediationCount } }
                            activeFiltersConfig={ activeFiltersConfig }
                        />
                        <Main>
                            <Stack hasGutter>
                                { permission.hasSmartManagement && !permission.isReceptorConfigured && noReceptorBannerVisible &&
                                    <StackItem>
                                        <NoReceptorBanner onClose={ () => handleNoReceptorToggle() }/>
                                    </StackItem>
                                }
                                { dialogOpen &&
                                    <ConfirmationDialog
                                        title={ selectedIds.length === 1 ? 'Remove playbook' : 'Remove playbooks' }
                                        text={ `${selectedIds.length} ${selectedIds.length > 1 ? 'playbooks' : 'playbook'} 
                                            will be removed from Remediations. This is permanent and cannot be undone.` }
                                        confirmText={ 'Remove' }
                                        onClose={ async (del) => {
                                            setDialogOpen(false);
                                            if (del) {
                                                await Promise.all(selectedIds.map(r => deleteRemediation(r)));
                                                loadRemediations();
                                                selector.reset();
                                            }
                                        } } />
                                }
                                <StackItem>
                                    <RemediationTable
                                        remediations={ remediations }
                                        loadRemediations={ loadRemediations }
                                        sorter={ sorter }
                                        filter={ filter }
                                        selector={ selector }
                                        pagination={ pagination }
                                        shouldUpdateGrid={ shouldUpdateGrid }
                                        setShouldUpdateGrid={ setShouldUpdateGrid }
                                        setRemediationCount={ setRemediationCount }
                                        showArchived={ showArchived }
                                        setShowArchived={ setShowArchived }
                                    />
                                </StackItem>
                            </Stack>
                        </Main>

                        <Wizard
                            isLarge
                            title="Create Plan"
                            className='ins-c-plan-modal'
                            onClose = { onClose }
                            isOpen= { isModalOpen }
                            content = { ModalStepContent }
                        />
                    </React.Fragment>
            }
        </PermissionContext.Consumer>
    );
}

export default Home;
