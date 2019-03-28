import React, { Fragment } from 'react';
import { Table, TableHeader, TableVariant } from '@patternfly/react-table';
import { Skeleton, TableToolbar, Spinner, EmptyTable } from '@red-hat-insights/insights-frontend-components';

import './SkeletonTable.scss';

class SkeletonTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            columns: [
                { title: <Skeleton size='xs'/> },
                { title: <Skeleton size='sm'/> },
                { title: <Skeleton size='sm'/> },
                { title: <Skeleton size='md'/> },
                { title: <Skeleton size='sm'/> }
            ],
            rows: [
                [
                    { title: <Skeleton size='md'/> },
                    { title: <Skeleton size='xs'/> },
                    { title: <Skeleton size='xs'/> },
                    { title: <Skeleton size='md'/> },
                    { title: <Skeleton size='md'/> }
                ]
            ]
        };
    }

    render() {
        const { columns, rows } = this.state;

        return (
            <Fragment>
                <Table
                    cells={ columns }
                    rows={ rows }
                    aria-label="Loading"
                    variant={ TableVariant.compact }
                    { ...this.props }>
                    <TableHeader />
                </Table>
                <EmptyTable centered>
                    <Spinner/>
                </EmptyTable>
                <TableToolbar isFooter className='ins-c-skeleton-table__footer ins-m-align-right'>
                    <Skeleton size='sm'/>
                </TableToolbar>
            </Fragment>
        );
    }
}

export default SkeletonTable;
