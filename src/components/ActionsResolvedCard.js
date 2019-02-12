import React from 'react';
import PropTypes from 'prop-types';

import {
    Skeleton
} from '@red-hat-insights/insights-frontend-components';

import {
    Card, CardHeader, CardBody,
    Progress, ProgressMeasureLocation,
    Level, LevelItem
} from '@patternfly/react-core';

function buildBody (status) {
    if (status.status !== 'fulfilled') {
        return <Skeleton size='md' />;
    }

    const { resolved, total } = status.data.summary;

    return <Progress
        value={ resolved }
        max={ total }
        label={ `${resolved} of ${total}` }
        measureLocation={ ProgressMeasureLocation.outside } />;
}

const ActionsResolvedCard = ({ status }) => (
    <Card className='ins-c-card__actions-resolved'>
        <CardHeader>
            <Level>
                <LevelItem className='ins-m-card__header-bold'>
                    Actions Resolved
                </LevelItem>
            </Level>
        </CardHeader>
        <CardBody>
            { buildBody(status) }
        </CardBody>
    </Card>
);

ActionsResolvedCard.propTypes = {
    status: PropTypes.object.isRequired
};

export default ActionsResolvedCard;

