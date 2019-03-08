import React, { Fragment } from 'react';
import { Table, TableHeader, TableBody, TableVariant } from '@patternfly/react-table';
import { Skeleton, TableToolbar } from '@red-hat-insights/insights-frontend-components';

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
                    onSelect
                    rows={ rows }
                    aria-label="Loading"
                    variant={ TableVariant.compact }
                    { ...this.props }>
                    <TableHeader />
                    <TableBody />
                </Table>
                <TableToolbar isFooter className='ins-c-skeleton-table__footer'>
                    <Skeleton size='sm'/>
                </TableToolbar>
            </Fragment>
        );
    }
}

export default SkeletonTable;
