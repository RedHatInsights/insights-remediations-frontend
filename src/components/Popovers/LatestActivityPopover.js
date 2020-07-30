import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { DateFormat } from '@redhat-cloud-services/frontend-components';

import {
    Popover, PopoverPosition,
    Flex, FlexItem
} from '@patternfly/react-core';

import { normalizeStatus, StatusSummary } from '../statusHelper';
import DescriptionList from '../Layouts/DescriptionList';

export const LatestActivityPopover = ({ mostRecent, children }) => {
    return (
        <Popover
            maxWidth='25rem'
            position={ PopoverPosition.bottom }
            headerContent={ <div>Latest Activity</div> }
            bodyContent={
                <Flex direction={ { default: 'column', sm: 'row' } }>
                    <Flex>
                        <FlexItem>
                            <DescriptionList
                                hasGutter
                                title='Run on'>
                                <span><DateFormat type='exact' date={ mostRecent.created_at } /></span>
                            </DescriptionList>
                        </FlexItem>
                        <FlexItem>
                            <DescriptionList
                                hasGutter
                                title='Run by'>
                                <span>{ `${mostRecent.created_by.first_name} ${mostRecent.created_by.last_name}` }</span>
                            </DescriptionList>
                        </FlexItem>
                    </Flex>
                    <Flex>
                        <FlexItem>
                            <DescriptionList
                                title='Status'>
                                <StatusSummary
                                    executorStatus={ normalizeStatus(mostRecent.status) }
                                    counts={ mostRecent.executors.reduce((acc, ex) => (
                                        { pending: acc.pending + ex.counts.pending,
                                            running: acc.running + ex.counts.running,
                                            success: acc.success + ex.counts.success,
                                            failure: acc.failure + ex.counts.failure,
                                            canceled: acc.canceled + ex.counts.canceled,
                                            acked: acc.acked + ex.counts.acked
                                        }), { pending: 0, running: 0, success: 0, failure: 0, canceled: 0, acked: 0 }) }/>
                            </DescriptionList>
                        </FlexItem>
                    </Flex>
                </Flex>
            }
            footerContent={ <Link to={ `/${mostRecent.remediation_id}/${mostRecent.id}` }>View activity details</Link> }
        >
            { /* Patternfly expects a single element here, so wrap in a fragment */ }
            <React.Fragment>
                { children }
            </React.Fragment>
        </Popover>
    );
};

LatestActivityPopover.propTypes = {
    mostRecent: PropTypes.object,
    children: PropTypes.any
};
