const localhost =
  process.env.PLATFORM === 'linux' ? 'localhost' : 'host.docker.internal';

exports.routes = {
  '/rhcs/remediations': { host: `https://${localhost}:8002` },
  '/insights/remediations': { host: `https://${localhost}:8002` },
  '/apps/remediations': { host: `https://${localhost}:8002` },
  '/beta/rhcs/remediations': { host: `https://${localhost}:8002` },
  '/beta/insights/remediations': { host: `https://${localhost}:8002` },
  '/beta/apps/remediations': { host: `https://${localhost}:8002` },
};
