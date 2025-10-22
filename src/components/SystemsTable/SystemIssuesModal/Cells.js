import React from 'react';
import { Content } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import { buildIssueUrl } from '../../../Utilities/urls';
import { getAppInfo } from '../../../Utilities/model';
import RebootColumn from '../RebootColumn';

export const IssueNameCell = ({ id, description, resolution }) => {
  return (
    <Content component="div">
      <div>
        <a href={buildIssueUrl(id)}>{description}</a>
      </div>
      {resolution?.description && <div>{resolution.description}</div>}
    </Content>
  );
};

IssueNameCell.propTypes = {
  id: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  resolution: PropTypes.shape({
    description: PropTypes.string,
  }),
};

export const RebootCell = ({ resolution }) => {
  return <RebootColumn rebootRequired={resolution?.needs_reboot} />;
};

RebootCell.propTypes = {
  resolution: PropTypes.shape({
    needs_reboot: PropTypes.bool,
  }),
};

export const TypeCell = ({ id }) => {
  return <Content component="p">{getAppInfo(id).label}</Content>;
};

TypeCell.propTypes = {
  id: PropTypes.string.isRequired,
};
