import React, { Fragment } from 'react';
import propTypes from 'prop-types';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import './issueResolution.scss';
import {
  Content,
  Stack,
  StackItem,
  Title,
  Alert,
  Popover,
  Button,
} from '@patternfly/react-core';
import { Tile } from '@patternfly/react-core/deprecated';
import {
  pluralize,
  shortenIssueId,
  RESOLUTIONS,
  SELECTED_RESOLUTIONS,
  SYSTEMS,
} from '../../../Utilities/utils';
import uniqBy from 'lodash/uniqBy';
import differenceWith from 'lodash/differenceWith';
import isEqual from 'lodash/isEqual';

const IssueResolution = ({ issue }) => {
  const formOptions = useFormApi();
  const resolutions = formOptions.getState().values[RESOLUTIONS];

  const systems = formOptions.getState().values[SYSTEMS][issue.id] || [];
  const issueResolutions =
    resolutions.find((r) => r.id === issue.id)?.resolutions || [];
  const uniqueResolutions = uniqBy(issueResolutions, 'id');
  const removedResolutions = differenceWith(
    issueResolutions,
    uniqueResolutions,
    isEqual,
  );

  return (
    <Stack hasGutter data-component-ouia-id="wizard-issue-resolution">
      <StackItem>
        <Title headingLevel="h2">
          {`Choose action: ${shortenIssueId(issue.id)}`}
        </Title>
      </StackItem>
      <StackItem>
        {removedResolutions.length > 0 && (
          <StackItem className="pf-v6-u-mb-sm">
            <Alert
              variant="warning"
              isInline
              title={
                <Content component="p">
                  There {pluralize(removedResolutions.length, 'was', 'were')}{' '}
                  <Popover
                    aria-label="Resolution duplicates popover"
                    bodyContent={
                      <Fragment>
                        {removedResolutions.map((resolution, key) => (
                          <div key={key}>{resolution.description}</div>
                        ))}
                      </Fragment>
                    }
                  >
                    <b>
                      <Button variant="link" isInline>
                        {removedResolutions.length}
                      </Button>{' '}
                      {pluralize(removedResolutions.length, 'resolution')}
                    </b>
                  </Popover>{' '}
                  removed due to duplication
                </Content>
              }
            />
          </StackItem>
        )}
        <Content>
          <Content component="p">
            Review the possible resolution steps and select which to add to your
            playbook.
          </Content>
          <Content
            component="p"
            className="ins-c-remediations-action-description"
          >
            {issue.action}
          </Content>
          <Content
            component="p"
            className="ins-c-remediations-action-description"
          >
            {`Resolution affects ${pluralize(systems.length, 'system')}`}
          </Content>
        </Content>
      </StackItem>
      <StackItem>
        <div className="ins-c-resolution-container">
          {uniqueResolutions.map((resolution, index) => (
            <div className="ins-c-resolution-option" key={resolution.id}>
              <Tile
                onClick={() =>
                  formOptions.change(SELECTED_RESOLUTIONS, {
                    ...formOptions.getState().values[SELECTED_RESOLUTIONS],
                    [issue.id]: resolution.id,
                  })
                }
                isSelected={
                  formOptions.getState().values[SELECTED_RESOLUTIONS][issue.id]
                    ? formOptions.getState().values[SELECTED_RESOLUTIONS][
                        issue.id
                      ] === resolution.id
                    : index === 0
                }
                title={resolution.description}
              >
                <Content className="pf-v6-u-pt-sm">
                  <Content
                    component="p"
                    className="pf-v6-u-mb-sm ins-c-playbook-description"
                  >
                    Resolution from &quot;{issue.id.split(/:|\|/)[1]}&quot;
                  </Content>
                  {
                    <div className="ins-c-reboot-required">
                      <Content component="span">
                        {resolution.needs_reboot ? (
                          'Reboot required'
                        ) : (
                          <span>
                            Reboot <b>not</b> required
                          </span>
                        )}
                      </Content>
                    </div>
                  }
                </Content>
              </Tile>
            </div>
          ))}
        </div>
      </StackItem>
    </Stack>
  );
};

IssueResolution.propTypes = {
  issue: propTypes.shape({
    id: propTypes.string,
    action: propTypes.string,
    alternate: propTypes.number,
    systems: propTypes.arrayOf(propTypes.string),
  }).isRequired,
};

export default IssueResolution;
