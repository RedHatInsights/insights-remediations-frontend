import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { Main, PageHeader, PageHeaderTitle } from '@red-hat-insights/insights-frontend-components';

class Home extends Component {

    constructor (props, ctx) {
        super(props, ctx);
    }

    render() {
        return (
            <React.Fragment>
                <PageHeader>
                    <PageHeaderTitle title='Remediations'></PageHeaderTitle>
                </PageHeader>
                <Main>
                    <p>here be remediations..</p>
                </Main>
            </React.Fragment>
        );
    }
}

Home.contextTypes = {
    store: PropTypes.object
};

export default withRouter(Home);
