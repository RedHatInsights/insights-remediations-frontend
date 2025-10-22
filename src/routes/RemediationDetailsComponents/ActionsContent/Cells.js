import React from 'react';
import { Content } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import { getAppInfo } from '../../../Utilities/model';

function buildToPath(key, description) {
  const { app, route } = getAppInfo(key);

  // compliance: no slug
  if (app === 'compliance') {
    return `/${route}`;
  }

  // advisor: slug comes from the id
  let raw =
    app === 'advisor' ? key.split(':')[1] : description.replace(/\s+/g, '_');

  // patch/packages: drop everything from first segment that starts with a digit
  if (route === 'packages') {
    const parts = raw.split(/[-_]/);
    // only consider as version if it has a dot in it
    const cut = parts.findIndex((p) => /^\d+\./.test(p));
    if (cut > 0) {
      raw = parts.slice(0, cut).join('-');
    }
  }

  const slug = encodeURIComponent(raw);
  return `/${route}/${slug}`;
}

export const ActionsCell = ({ id, description = '', resolution }) => {
  const { app } = getAppInfo(id);

  return (
    <Content component="p">
      <InsightsLink app={app} to={buildToPath(id, description)}>
        {description}
      </InsightsLink>
      {resolution?.description && <p>{resolution.description}</p>}
    </Content>
  );
};
export const RebootRequiredCell = ({ resolution }) => (
  <Content component="p">{resolution?.needs_reboot ? 'Yes' : 'No'}</Content>
);

export const SystemsCell = ({ systems }) => (
  <Content component="p">{`${systems?.length} system${systems?.length > 1 ? 's' : ''}`}</Content>
);

export const IssueTypeCell = ({ id }) => (
  <Content component="p">{getAppInfo(id)?.label}</Content>
);

ActionsCell.propTypes = {
  description: PropTypes.string.isRequired,
  resolution: PropTypes.shape({ description: PropTypes.string }),
  id: PropTypes.string.isRequired,
};
RebootRequiredCell.propTypes = {
  resolution: PropTypes.shape({ needs_reboot: PropTypes.bool }),
};
SystemsCell.propTypes = {
  systems: PropTypes.arrayOf(PropTypes.object),
};
IssueTypeCell.propTypes = {
  id: PropTypes.string.isRequired,
};
