/* global exports */

const localhost = (process.env.PLATFORM === 'linux') ? 'localhost' : 'host.docker.internal';

exports.routes = {
    '/r/insights/platform/remediations': {
        host: `http://${localhost}:9002`
    }
};
