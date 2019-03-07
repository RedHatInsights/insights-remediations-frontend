import { useState } from 'react';
import debounce from 'lodash/debounce';
import filter from 'lodash/filter';
import pickBy from 'lodash/pickBy';
import keys from 'lodash/keys';
import keyBy from 'lodash/keyBy';
import mapValues from 'lodash/mapValues';
import identity from 'lodash/identity';
import intersection from 'lodash/intersection';

import { SEARCH_DEBOUNCE_DELAY } from '../constants';

const chain = (f1, f2) => (...args) => {
    f1(...args);
    f2(...args);
};

/**
 * Returns a function f that, when called, invokes a sequence of callback functions.
 *
 * By default, this sequence only contains the identity function.
 * Additional callback functions can be added to the sequence by calling f.add().
 * When the function is called with parameters, e.g. f(1, 2), these parameters are passed to callback functions.
 * Callback functions may return a promise however these will *not* be awaited.
 * If a callback function throws an exception any following callback functions will *not* be invoked.
 *
 * Usage:
 * const f = callbacks();
 *
 * f.add(value => console.log(value));
 * f.add(value => console.log(value + 1));
 * f.add(value => console.log(value + 2));
 *
 * f(5); // prints 5 6 7
 */
function callbacks () {
    let cb = identity;
    const fn = (...args) => cb(...args);
    fn.add = f => cb = chain(cb, f);
    return fn;
}

function assertId (id) {
    if (id === undefined) {
        throw new Error('row does not define id!');
    }
}

export function useSorter (defaultSortBy = 2, defaultSortDir = 'asc') {
    const [ sortBy, setSortBy ] = useState(defaultSortBy);
    const [ sortDir, setSortDir ] = useState(defaultSortDir);

    const cb = callbacks();

    return {
        sortBy,
        sortDir,
        onChange: cb.add,
        props: {
            sortBy: {
                index: sortBy,
                direction: sortDir
            },
            onSort (event, sortBy, sortDir) {
                setSortBy(sortBy);
                setSortDir(sortDir);
                cb(sortBy, sortDir);
            }
        }
    };
}

export function useFilter () {
    const [ value, setValue ] = useState('');

    const cb = callbacks();

    const onValueChange = debounce(value => {
        setValue(value);
        cb(value);
    }, SEARCH_DEBOUNCE_DELAY);

    return {
        value,
        setValue: onValueChange,
        onChange: cb.add,
        props: {
            onFilterChange: onValueChange
        }
    };
}

export function useExpander (rowToId = row => row.id) {
    const [ value, setValue ] = useState(false);
    let rows = false;

    return {
        value,
        register: r => {
            rows = r;
            rows.forEach(row => {
                if (rowToId(row) === value) {
                    row.isOpen = true;
                }
            });
        },
        props: {
            onCollapse (event, index, value) {
                if (!rows) {
                    throw new Error('register() not called on useExpander()');
                }

                const id = rowToId(rows[index]);
                assertId(id);

                setValue(value ? id : false);
            }
        }
    };
}

export function usePagination () {
    const [ page, setPage ] = useState(1);
    const [ pageSize, setPageSize ] = useState(10);

    const reset = () => setPage(1);
    const cb = callbacks();

    return {
        page,
        offset: (page - 1) * pageSize,
        pageSize,
        setPage,
        onChange: cb.add,
        reset,
        props: {
            page,
            itemsPerPage: pageSize,
            onSetPage (value) {
                setPage(value);
                cb(value, pageSize);
            },
            onPerPageSelect (value) {
                setPageSize(value);
                reset();
                cb(page, value);
            }
        }
    };
}

function onSelectOne (selected, isSelected, id) {
    assertId(id);

    return {
        ...selected,
        [id]: isSelected
    };
}

function onSelectAll (rows, value, isSelected, rowToId) {
    const rowIds = keyBy(filter(rows, row => rowToId(row)), rowToId);

    return {
        ...value,
        ...mapValues(rowIds, () => isSelected)
    };
}

export function useSelector (rowToId = row => row.id) {
    const [ value, setValue ] = useState({});
    let rows = false;

    return {
        getSelectedIds (possibleIds) {
            const selected = keys(pickBy(value, identity));
            if (possibleIds) {
                return intersection(selected, possibleIds);
            }

            return selected;
        },
        register: r => {
            rows = r;
            rows.forEach(row => row.selected = value[rowToId(row)] === true);
        },
        props: {
            onSelect: (unused, isSelected, index) => {
                if (!rows) {
                    throw new Error('register() not called on useSelector()');
                }

                setValue((index === -1) ?
                    onSelectAll(rows, value, isSelected, rowToId) :
                    onSelectOne(value, isSelected, rowToId(rows[index]))
                );
            }
        }
    };
}
