import { ACTION_TYPES } from './constants';
import { getRemediations } from './api';

export const loadRemediations = () => ({
    type: ACTION_TYPES.LOAD_REMEDIATIONS,
    payload: getRemediations()
});
