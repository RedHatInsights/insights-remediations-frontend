import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
    Form,
    Radio,
    Stack,
    StackItem
} from '@patternfly/react-core';

import {
    Reboot
} from '@red-hat-insights/insights-frontend-components';

import { getResolutions } from '../../api';

import './ChooseResolutionModal.scss';

class ResolutionStep extends Component {

    constructor (props) {
        super(props);
        this.issue = props.issue;
        this.state = {
            selected: props.issue.resolution,
            resolutions: false
        };
    };

    onRadioChange = resolution => {
        this.setState({ selected: resolution });
    };

    async componentDidMount () {
        const resolutions = await getResolutions(this.issue.id);
        this.setState({ resolutions });
    }

    getSelectedResolution = () => {
        return this.state.selected;
    }

    render() {

        const { resolutions, selected } = this.state;

        if (!resolutions) {
            return null; // TODO loading
        }

        return (
            <Stack gutter='sm'>
                <StackItem><h1>{ this.issue.description }</h1></StackItem>
                <StackItem><h2>Would you like to:</h2></StackItem>
                <StackItem>
                    <Form>
                        {
                            resolutions.resolutions.map(resolution => (
                                <div className="ins-c-resolution-option" key={ resolution.id }>
                                    <Radio
                                        label={
                                            <Stack className='ins-c-resolution-choice__details'>
                                                <StackItem>{ resolution.description }</StackItem>
                                                { /*
                                                <StackItem>
                                                    <Battery label="Resolution risk" severity={ resolution.resolution_risk } />
                                                </StackItem>
                                                */ }
                                                { resolution.needs_reboot &&
                                                    <StackItem> <Reboot red/> </StackItem>
                                                }
                                            </Stack>
                                        }
                                        aria-label={ resolution.description }
                                        id={ resolution.id }
                                        name="radio"
                                        defaultChecked={ resolution.id === selected.id }
                                        onChange={ () => this.onRadioChange(resolution) }
                                    />
                                </div>
                            ))
                        }
                    </Form>
                </StackItem>
            </Stack>
        );
    }
};

ResolutionStep.propTypes = {
    issue: PropTypes.object.isRequired
};

export default ResolutionStep;
