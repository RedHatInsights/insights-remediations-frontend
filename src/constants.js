import keyBy from 'lodash/keyBy';
import flatMap from 'lodash/flatMap';

const asyncActions = flatMap([
    'LOAD_REMEDIATIONS'
], a => [ a, `${a}_PENDING`, `${a}_FULFILLED`, `${a}_REJECTED` ]);

export const ACTION_TYPES = keyBy([ ...asyncActions ], k => k);
