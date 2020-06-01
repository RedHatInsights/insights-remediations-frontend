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
                cb(sortBy, sortDir);
                setSortBy(sortBy);
                setSortDir(sortDir);
            }
        }
    };
}

export function useFilter () {
    const [ value, setValue ] = useState('');

    const cb = callbacks();

    const onValueChange = debounce(value => {
        cb(value);
        setValue(value);
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
        getExpandedIds(possibleIds) {
            const expanded = keys(pickBy(value, identity));
            if (possibleIds) {
                return intersection(expanded, possibleIds);
            }

            return expanded;
        },
        props: {
            onCollapse (event, index, value) {
                if (!rows) {
                    throw new Error('register() not called on useExpander()');
                }
                console.log('EXPAND', index, value)

                const id = rowToId(rows[index]);
                assertId(id);
                console.log(id, value);

                setValue(value ? id : false);
            }
        }
    };
}

export function usePagination () {
    const [ page, setPage ] = useState(1);
    const [ pageDebounced, setPageDebounced ] = useState(1);
    const [ pageSize, setPageSize ] = useState(10);

    const reset = () => setPage(1);
    const cb = callbacks();

    return {
        page,
        pageDebounced,
        offset: (page - 1) * pageSize,
        pageSize,
        setPage,
        onChange: cb.add,
        reset,
        props: {
            page,
            perPage: pageSize,
            onSetPage (event, value) {
                setPage(value);
                event.target.tagName === 'INPUT' ?
                    debounce(setPageDebounced, SEARCH_DEBOUNCE_DELAY)(value) :
                    setPageDebounced(value);
                cb(value, pageSize);
            },
            onPerPageSelect (event, value) {
                cb(page, value);
                reset();
                setPageSize(value);
            }
        }
    };
}

function onSelectOne (selected, isSelected, id) {
    assertId(id);

    const result = {
        ...selected,
        [id]: isSelected
    };

    console.log('on Select ONE', result);
    return result;
}

function onSelectAll (rows, value, isSelected, rowToId) {
    const rowIds = keyBy(filter(rows, row => rowToId(row)), rowToId);

    return {
        ...value,
        ...mapValues(rowIds, () => isSelected)
    };
}

function isSelected (value, id) {
    return value.hasOwnProperty(id) ? value[id] : false;
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
        reset: () => setValue({}),
        props: {
            onSelect: (unused, isSelected, index) => {
                if (!rows) {
                    throw new Error('register() not called on useSelector()');
                }

                setValue(value => (index === -1) ?
                    onSelectAll(rows, value, isSelected, rowToId) :
                    onSelectOne(value, isSelected, rowToId(rows[index]))
                );
            }
        },
        tbodyProps: {
            onRowClick (event, row) {
                if ([ 'A', 'BUTTON', 'INPUT' ].includes(event.target.tagName)) {
                    return;
                }

                const id = rowToId(row);
                assertId(id);
                setValue(value => ({
                    ...value,
                    [id]: !isSelected(value, id)
                }));
            }
        }
    };
}
