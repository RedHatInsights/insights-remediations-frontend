import React from 'react';

import keyBy from 'lodash/keyBy';
import mapValues from 'lodash/mapValues';
import pickBy from 'lodash/pickBy';
import keys from 'lodash/keys';
import has from 'lodash/has';
import filter from 'lodash/filter';

import { Table } from '@patternfly/react-table';

export default class SelectableTable extends React.Component {

    state = {
        selected: {}
    }

    onSelectAll (isSelected) {
        if (!isSelected) {
            return {};
        }

        return mapValues(keyBy(filter(this.props.rows, row => has(row, 'id')), r => r.id), () => true);
    }

    onSelectOne (selected, isSelected, index) {
        const row = this.props.rows[index];

        if (!has(row, 'id')) {
            return selected;
        }

        if (!isSelected) {
            return pickBy(selected, (value, key) => key !== row.id);
        }

        return {
            ...selected,
            [row.id]: true
        };
    }

    // TODO: using index like this may break once pagination is added
    onSelect = (isSelected, unused, index) => {
        this.setState(state => {
            const selected = (index === -1) ?
                this.onSelectAll(isSelected) :
                this.onSelectOne(state.selected, isSelected, index);

            this.props.onSelect(keys(selected));
            return { selected };
        });
    };

    render () {
        this.props.rows.forEach(row => {
            if (has(row, 'id')) {
                row.selected = this.state.selected[row.id] === true;
            }
        });

        return <Table { ...this.props } onSelect={ this.onSelect } rows={ this.props.rows } />;
    }
}

SelectableTable.defaultProps = {
    onSelect: f=>f
};
