/*global module, process*/

const localhost = (process.env.PLATFORM === 'linux') ? 'localhost' : 'host.docker.internal';

module.exports = {
    routes: {
        '/rhcs/remediations': { host: `http://${localhost}:8002` },
        '/insights/remediations': { host: `http://${localhost}:8002` },
        '/apps/remediations': { host: `http://${localhost}:8002` },
        '/apps/chrome': { host: 'https://ci.cloud.paas.upshift.redhat.com' },
        '/r/insights/platform': { host: 'http://access.ci.cloud.paas.upshift.redhat.com' },
        '/r/insights/platform/remediations': { host: `http://${localhost}:9002` }
    }
};
