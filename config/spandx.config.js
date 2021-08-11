const localhost =
  process.env.PLATFORM === 'linux' ? 'localhost' : 'host.docker.internal';

exports.routes = {
  '/rhcs/remediations': { host: `http://${localhost}:8002` },
  '/insights/remediations': { host: `http://${localhost}:8002` },
  '/apps/remediations': { host: `http://${localhost}:8002` },
  '/beta/rhcs/remediations': { host: `http://${localhost}:8002` },
  '/beta/insights/remediations': { host: `http://${localhost}:8002` },
  '/beta/apps/remediations': { host: `http://${localhost}:8002` },
  ...process.env.LOCAL_API?.split(',')?.reduce((acc, curr) => {
    const [appName, appConfig] = curr?.split(':');
    const [appPort = 8003, protocol = 'http'] = appConfig.split('~');
    return {
      ...acc,
      [`/apps/${appName}`]: { host: `${protocol}://localhost:${appPort}` },
      [`/insights/${appName}`]: { host: `${protocol}://localhost:${appPort}` },
      [`/beta/insights/${appName}`]: {
        host: `${protocol}://localhost:${appPort}`,
      },
      [`/beta/apps/${appName}`]: { host: `${protocol}://localhost:${appPort}` },
    };
  }, {}),
};
