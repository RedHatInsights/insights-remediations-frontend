/*global RELEASE:true*/

export const API_BASE = '/api/remediations/v1';

export const isBeta = RELEASE === 'beta/apps';

const DEMO_ACCOUNT = '6216449';

export async function isDemo () {
    if (isBeta) {
        const user = await window.insights.chrome.auth.getUser();

        if (user.identity.account_number === DEMO_ACCOUNT) {
            return true;
        }

        return user.identity.user.is_internal && localStorage.getItem('remediations:demo') === 'true';
    }
}
