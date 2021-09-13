import React from 'react';
import PropTypes from 'prop-types';

import { Skeleton } from '@redhat-cloud-services/frontend-components/Skeleton';

import {
  Card,
  CardHeader,
  CardBody,
  Progress,
  ProgressMeasureLocation,
} from '@patternfly/react-core';

function buildBody(status) {
  if (status.status !== 'fulfilled') {
    return <Skeleton size="lg" />;
  }

  const { resolved, total } = status.data.summary;

  return (
    <Progress
      value={resolved}
      max={total}
      label={`${resolved} of ${total}`}
      measureLocation={ProgressMeasureLocation.outside}
    />
  );
}

const ActionsResolvedCard = ({ status }) => (
  <Card className="ins-c-card__actions-resolved">
    <CardHeader className="rem-m-card__header-bold">
      Actions Resolved
    </CardHeader>
    <CardBody>{buildBody(status)}</CardBody>
  </Card>
);

ActionsResolvedCard.propTypes = {
  status: PropTypes.object.isRequired,
};

export default ActionsResolvedCard;
