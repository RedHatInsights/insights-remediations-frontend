import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { Main } from '@red-hat-insights/insights-frontend-components';

class RemediationList extends Component {

    constructor (props, ctx) {
        super(props, ctx);
    }

    render() {
        return (
            <Main>
                <h1>Remediations</h1>
            </Main>
        );
    }
}

RemediationList.contextTypes = {
    store: PropTypes.object
};

export default withRouter(RemediationList);
