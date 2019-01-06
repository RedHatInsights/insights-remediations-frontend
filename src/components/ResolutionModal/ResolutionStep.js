import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
    Form,
    Radio
} from '@patternfly/react-core';

import {
    Ansible,
    Battery
} from '@red-hat-insights/insights-frontend-components';

import { getResolutions } from '../../api';

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
            <React.Fragment>
                <h1>{ this.issue.description }</h1>
                <h2>Would you like to:</h2>
                <Form>
                    {
                        resolutions.resolutions.map(resolution => (
                            <div className="ins-c-resolution-option" key={ resolution.id }>
                                <Radio
                                    label={
                                        <div>
                                            { resolution.description }
                                            <Battery label="Resolution risk" severity={ resolution.resolution_risk } />
                                            TODO: reboot indication goes here instead of Ansible icon
                                            <Ansible unsupported={ !resolution.needs_reboot } />
                                        </div>
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
            </React.Fragment>
        );
    }
};

ResolutionStep.propTypes = {
    issue: PropTypes.object.isRequired
};

export default ResolutionStep;
