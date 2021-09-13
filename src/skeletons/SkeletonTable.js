import React, { Fragment } from 'react';
import { Table, TableHeader, TableVariant } from '@patternfly/react-table';
import { Skeleton } from '@redhat-cloud-services/frontend-components/Skeleton';
import { TableToolbar } from '@redhat-cloud-services/frontend-components/TableToolbar';
import { Spinner } from '@redhat-cloud-services/frontend-components/Spinner';
import { EmptyTable } from '@redhat-cloud-services/frontend-components/EmptyTable';

import './SkeletonTable.scss';

class SkeletonTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        { title: <Skeleton size="xs" /> },
        { title: <Skeleton size="sm" /> },
        { title: <Skeleton size="sm" /> },
        { title: <Skeleton size="md" /> },
        { title: <Skeleton size="sm" /> },
      ],
      rows: [
        [
          { title: <Skeleton size="md" /> },
          { title: <Skeleton size="xs" /> },
          { title: <Skeleton size="xs" /> },
          { title: <Skeleton size="md" /> },
          { title: <Skeleton size="md" /> },
        ],
      ],
    };
  }

  render() {
    const { columns, rows } = this.state;

    return (
      <Fragment>
        <Table
          cells={columns}
          rows={rows}
          aria-label="Loading"
          variant={TableVariant.compact}
          {...this.props}
        >
          <TableHeader />
        </Table>
        <EmptyTable centered>
          <Spinner />
        </EmptyTable>
        <TableToolbar
          isFooter
          className="rem-c-skeleton-table__footer rem-m-align-right"
        >
          <Skeleton size="sm" />
        </TableToolbar>
      </Fragment>
    );
  }
}

export default SkeletonTable;
