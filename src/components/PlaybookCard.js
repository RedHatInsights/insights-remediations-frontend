import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    Badge, Card, CardBody, CardHeader, CardActions, CardTitle,
    Dropdown, DropdownItem, KebabToggle,
    Progress, ProgressMeasureLocation, ProgressVariant,
    Split, SplitItem, Stack, StackItem
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons';
import { DateFormat } from '@redhat-cloud-services/frontend-components';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/esm/actions';
import { Link } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import { patchRemediation } from '../actions.js';

import './PlaybookCard.scss';

function buildName (name, id) {
    return (
        <Link to={ `/${id}` } className='ins-c-playbook-card__header--name'>{ name }</Link>
    );
}

const PlaybookCardHeader = ({
    remediation,
    remediationIdx,
    archived,
    selector,
    setExecuteOpen,
    update,
    loadRemediation,
    getConnectionStatus,
    downloadPlaybook,
    permission
}) => {
    const [ isOpen, setIsOpen ] = useState(false);
    const [ isChecked, setIsChecked ] = useState(false);
    const [ isArchived, setIsArchived ] = useState(archived);
    const dispatch = useDispatch();
    const dropdownItems = [];

    const actionWrapper = (actionsList, callback) => {
        Promise.all(actionsList.map((event) => {
            dispatch(event);
            return event.payload;
        })).then(callback);
    };

    const archiveHandler = () => {
        actionWrapper([
            patchRemediation(remediation.id, { archived: !isArchived })
        ], () => { setIsArchived(!isArchived); update(true); });
    };

    dropdownItems.push(
        <DropdownItem
            key='execute'
            id='execute'
            isDisabled= { !permission.isReceptorConfigured || isArchived }
            className= { `${(!permission.hasSmartManagement || !permission.permissions.execute) && 'ins-m-not-entitled'}` }
            onClick={ () => {
                setExecuteOpen(false);
                actionWrapper([
                    loadRemediation(remediation.id),
                    getConnectionStatus(remediation.id)
                ], () => { setExecuteOpen(true); setIsOpen(false); });
            } }>
        Execute playbook
        </DropdownItem>
    );

    dropdownItems.push(
        <DropdownItem key='download'
            onClick={ () => { downloadPlaybook(remediation.id); setIsOpen(false); } }>
        Download playbook
        </DropdownItem>
    );

    isArchived
        ? dropdownItems.push(
            <DropdownItem key='restore'
                onClick={ () => {
                    archiveHandler();
                    setIsOpen(false);
                    dispatch(
                        addNotification({
                            variant: 'info',
                            title: `Restored playbook ${remediation.name}`
                        })
                    );
                } }>
            Restore playbook
            </DropdownItem>
        )
        : dropdownItems.push(
            <DropdownItem key='archive'
                onClick={ () => {
                    archiveHandler();
                    setIsOpen(false);
                    dispatch(
                        addNotification({
                            variant: 'info',
                            title: `Archived playbook ${remediation.name}`
                        })
                    );
                } }>
            Archive playbook
            </DropdownItem>
        );

    return (
        <CardHeader className='ins-c-playbook-card__header'>
            <CardActions>
                <Dropdown
                    key='dropdown'
                    id={ `${remediation.id}-dropdown` }
                    isOpen={ isOpen }
                    isPlain
                    onSelect={ f => f }
                    toggle={
                        <KebabToggle
                            id={ `${remediation.id}-toggle` }
                            onToggle={ (isOpen) => setIsOpen(isOpen) }/> }
                    dropdownItems={ dropdownItems }
                    position={ 'right' }
                />
                <input
                    type="checkbox"
                    name={ `${remediation.id}-checkbox` }
                    checked={ selector.getSelectedIds().includes(remediation.id) }
                    onChange={ (e) => {
                        setIsChecked(e.target.checked);
                        isChecked
                            ? selector.props.onSelect(e, false, remediationIdx)
                            : selector.props.onSelect(e, true, remediationIdx);
                    } }
                    aria-label={ `${remediation.id}-checkbox` }
                />
            </CardActions>
            <CardTitle>
                <Stack hasGutter>
                    <StackItem className='ins-c-playbook-card__header--title'>
                        { isArchived &&
                            <Badge isRead className='ins-c-playbook-card__header--badge'>
                            Archived
                            </Badge>
                        }
                        { buildName(remediation.name, remediation.id) }
                    </StackItem>
                    <StackItem className='ins-c-playbook-card__header--last-modified'>
                    Last modified: <DateFormat date={ remediation.updated_at } />
                    </StackItem>
                </Stack>
            </CardTitle>
        </CardHeader>
    );
};

PlaybookCardHeader.propTypes = {
    remediation: PropTypes.object.isRequired,
    remediationIdx: PropTypes.number.isRequired,
    archived: PropTypes.bool.isRequired,
    selector: PropTypes.object.isRequired,
    setExecuteOpen: PropTypes.func.isRequired,
    update: PropTypes.func.isRequired,
    loadRemediation: PropTypes.func.isRequired,
    getConnectionStatus: PropTypes.func.isRequired,
    downloadPlaybook: PropTypes.func.isRequired,
    permission: PropTypes.object.isRequired
};

const renderActionStatus = (complete, total) => {
    return (complete === total
        ? <div><CheckCircleIcon className='ins-c-remediations-success'/> { complete } of { total }</div>
        : `${complete} of ${total}`
    );
};

const renderProgress = (complete, total) => {
    return (complete === total
        ? <Progress className='ins-c-playbook-card__progress ins-c-playbook-card__progress--success'
            value={ 100 }
            measureLocation={ ProgressMeasureLocation.none }
            variant={ ProgressVariant.success }/>
        : <Progress className='ins-c-playbook-card__progress'
            value={ (complete / total * 100) }
            measureLocation={ ProgressMeasureLocation.none }/>
    );
};

export const PlaybookCard = ({
    remediation,
    remediationIdx,
    archived,
    selector,
    setExecuteOpen,
    update,
    loadRemediation,
    getConnectionStatus,
    downloadPlaybook,
    permission
}) => {
    return (
        <Card className='ins-c-playbook-card' isCompact>
            <PlaybookCardHeader
                remediation={ remediation }
                remediationIdx={ remediationIdx }
                archived={ archived }
                selector={ selector }
                setExecuteOpen={ setExecuteOpen }
                update={ update }
                loadRemediation={ loadRemediation }
                getConnectionStatus={ getConnectionStatus }
                downloadPlaybook={ downloadPlaybook }
                permission={ permission }
            />
            <CardBody className='ins-c-playbook-card__body'>
                <Split hasGutter className='ins-c-playbook-card__body--split'>
                    <SplitItem>
                        <Stack>
                            <StackItem className='ins-c-playbook-card__body--titles'>
                            Systems
                            </StackItem>
                            <StackItem className='ins-c-playbook-card__body--values'>
                                { remediation.system_count }
                            </StackItem>
                        </Stack>
                    </SplitItem>
                    <SplitItem>
                        <Stack>
                            <StackItem className='ins-c-playbook-card__body--titles'>
                            Complete actions
                            </StackItem>
                            <StackItem className='ins-c-playbook-card__body--values'>
                                { renderActionStatus(remediation.resolved_count, remediation.issue_count) }
                            </StackItem>
                        </Stack>
                    </SplitItem>
                </Split>
            </CardBody>
            { renderProgress(remediation.resolved_count, remediation.issue_count) }
        </Card>
    );
};

PlaybookCard.propTypes = {
    remediation: PropTypes.object.isRequired,
    remediationIdx: PropTypes.number.isRequired,
    archived: PropTypes.bool.isRequired,
    selector: PropTypes.object.isRequired,
    setExecuteOpen: PropTypes.func.isRequired,
    update: PropTypes.func.isRequired,
    loadRemediation: PropTypes.func.isRequired,
    getConnectionStatus: PropTypes.func.isRequired,
    downloadPlaybook: PropTypes.func.isRequired,
    permission: PropTypes.object.isRequired
};
