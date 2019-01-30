import React from 'react';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';
import { Skeleton } from '@red-hat-insights/insights-frontend-components';

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
            <Table cells={ columns } rows={ rows } aria-label="Loading">
                <TableHeader />
                <TableBody />
            </Table>
        );
    }
}

export default SkeletonTable;
