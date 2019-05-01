import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Wizard } from '@red-hat-insights/insights-frontend-components';
import ResolutionStep from './ResolutionModal/ResolutionStep';

class ResolutionEditButton extends Component {

    constructor (props) {
        super(props);
        this.state = {
            open: false
        };
    };

    setOpen = open => this.setState({ open });
    openModal = () => this.setOpen(true);

    onModalClose = (result) => {
        this.setOpen(false);

        const { remediation, issue, onResolutionSelected } = this.props;
        const resolution = this.resolutionStep.getSelectedResolution();

        if (result && issue.resolution.id !== resolution.id) {
            onResolutionSelected(remediation.id, issue.id, resolution.id);
        }
    };

    render() {
        const { open } = this.state;

        return (
            <React.Fragment>
                <a onClick={ this.openModal }>Edit</a>
                {
                    open &&
                    <Wizard
                        isLarge
                        title="Edit resolution"
                        className='ins-c-resolution-modal'
                        confirmAction='Save'
                        onClose = { this.onModalClose }
                        isOpen= { true }
                        content = { [
                            <ResolutionStep
                                key="ResolutionStep"
                                issue={ this.props.issue }
                                ref={ ref => this.resolutionStep = ref }
                                getResolutions={ this.props.getResolutions }
                            />
                        ] }
                    />
                }
            </React.Fragment>
        );
    }
}

ResolutionEditButton.propTypes = {
    remediation: PropTypes.object.isRequired,
    issue: PropTypes.object.isRequired,
    onResolutionSelected: PropTypes.func.isRequired,
    getResolutions: PropTypes.func.isRequired
};

export default ResolutionEditButton;
