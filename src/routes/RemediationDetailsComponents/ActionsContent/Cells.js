import React from 'react';
import { Content, Button, Flex, FlexItem, Icon } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import { InfoCircleIcon } from '@patternfly/react-icons';
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

export const ActionsCell = ({
  id,
  description = '',
  resolution,
  resolutions_available,
  onViewResolutionOptions,
  selectedIssueForResolutionId,
}) => {
  const { app } = getAppInfo(id);
  const hasMultipleResolutions = resolutions_available > 1;

  return (
    <Content component="div">
      <Flex
        direction={{ default: 'column' }}
        spaceItems={{ default: 'spaceItemsSm' }}
      >
        <FlexItem>
          <InsightsLink app={app} to={buildToPath(id, description)}>
            {description}
          </InsightsLink>
          {resolution?.description && (
            <Content component="p" className="pf-v6-u-mt-xs">
              {resolution.description}
            </Content>
          )}
        </FlexItem>
        {hasMultipleResolutions && (
          <>
            <FlexItem>
              <Flex
                spaceItems={{ default: 'spaceItemsSm' }}
                alignItems={{ default: 'alignItemsCenter' }}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onViewResolutionOptions?.(id)}
                  style={
                    selectedIssueForResolutionId === id
                      ? {
                          border: '1px solid',
                          borderColor:
                            'var(--pf-v6-global--primary-color--100)',
                        }
                      : {}
                  }
                >
                  View resolution options
                </Button>
                <Flex
                  spaceItems={{ default: 'spaceItemsSm' }}
                  alignItems={{ default: 'alignItemsCenter' }}
                >
                  <Icon status="info">
                    <InfoCircleIcon />
                  </Icon>
                  <Content
                    component="span"
                    className="pf-v6-u-font-weight-bold pf-v6-u-font-size-sm"
                  >
                    Multiple resolutions
                  </Content>
                </Flex>
              </Flex>
            </FlexItem>
          </>
        )}
      </Flex>
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
  resolutions_available: PropTypes.number,
  onViewResolutionOptions: PropTypes.func,
  selectedIssueForResolutionId: PropTypes.string,
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
