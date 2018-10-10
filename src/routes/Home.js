import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { Main, PageHeader, PageHeaderTitle, Table } from '@red-hat-insights/insights-frontend-components';

function buildName (name, id) {
    return (
        <Link to={ `/${id}` }>{ name }</Link>
    );
}

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
                    <p>Your plans</p>
                    <Table
                        header={ [ 'Name', '# of issues', 'Last updated', 'Reboot required' ] }
                        rows={ [
                            {
                                cells: [
                                    buildName('High severity security issues', 'aba007d6-be73-4e96-9399-2967be2c2401'),
                                    23,
                                    '2018-10-10',
                                    'yes'
                                ]
                            }
                        ] }
                    />
                </Main>
            </React.Fragment>
        );
    }
}

Home.contextTypes = {
    store: PropTypes.object
};

export default withRouter(Home);
