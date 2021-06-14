import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  Form,
  Label,
  Radio,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { Reboot } from '@redhat-cloud-services/frontend-components/Reboot';
import { Skeleton } from '@redhat-cloud-services/frontend-components/Skeleton';

import './ChooseResolutionModal.scss';

class ResolutionStep extends Component {
  constructor(props) {
    super(props);
    this.issue = props.issue;
    this.state = {
      selected: props.issue.resolution,
      resolutions: false,
    };
  }

  onRadioChange = (resolution) => {
    this.setState({ selected: resolution });
  };

  async componentDidMount() {
    const resolutions = await this.props.getResolutions(this.issue.id);
    this.setState({ resolutions: resolutions.value });
  }

  getSelectedResolution = () => {
    return this.state.selected;
  };

  render() {
    const { resolutions, selected } = this.state;
    let resolutionsDisplay;

    if (resolutions) {
      resolutionsDisplay = (
        <React.Fragment>
          <StackItem>
            <Form>
              {resolutions.resolutions.map((resolution) => (
                <div className="ins-c-resolution-option" key={resolution.id}>
                  <Radio
                    label={
                      <Stack className="ins-c-resolution-choice__details">
                        <StackItem>{resolution.description}</StackItem>
                        {/*
                                                    <StackItem>
                                                        <Battery label="Resolution risk" severity={ resolution.resolution_risk } />
                                                    </StackItem>
                                                    */}
                        {resolution.needs_reboot && (
                          <StackItem>
                            <Reboot red />
                          </StackItem>
                        )}
                      </Stack>
                    }
                    aria-label={resolution.description}
                    id={resolution.id}
                    name="radio"
                    defaultChecked={resolution.id === selected.id}
                    onChange={() => this.onRadioChange(resolution)}
                  />
                </div>
              ))}
            </Form>
          </StackItem>
        </React.Fragment>
      );
    } else {
      resolutionsDisplay = (
        <React.Fragment>
          <StackItem>
            <Skeleton />
          </StackItem>
          <StackItem>
            <Skeleton />
          </StackItem>
          <StackItem>
            <Skeleton />
          </StackItem>
        </React.Fragment>
      );
    }

    return (
      <Stack hasGutter>
        <StackItem>
          <div>Select resolution for this action.</div>
        </StackItem>
        <StackItem>
          <Split hasGutter>
            <SplitItem>
              <Label>Action</Label>
            </SplitItem>
            <SplitItem isFilled>
              <h1 className="ins-m-text__bold">{this.issue.description}</h1>
            </SplitItem>
          </Split>
        </StackItem>

        {resolutionsDisplay}
      </Stack>
    );
  }
}

ResolutionStep.propTypes = {
  issue: PropTypes.object.isRequired,
  getResolutions: PropTypes.func.isRequired,
};

export default ResolutionStep;
