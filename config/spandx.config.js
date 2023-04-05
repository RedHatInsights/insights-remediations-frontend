const localhost =
  process.env.PLATFORM === 'linux' ? 'localhost' : 'host.docker.internal';

exports.routes = {
  '/rhcs/remediations': { host: `http://${localhost}:8002` },
  '/insights/remediations': { host: `http://${localhost}:8002` },
  '/apps/remediations': { host: `http://${localhost}:8002` },
  '/preview/rhcs/remediations': { host: `http://${localhost}:8002` },
  '/preview/insights/remediations': { host: `http://${localhost}:8002` },
  '/preview/apps/remediations': { host: `http://${localhost}:8002` },
  ...process.env.LOCAL_API?.split(',')?.reduce((acc, curr) => {
    const [appName, appConfig] = curr?.split(':');
    const [appPort = 8003, protocol = 'http'] = appConfig.split('~');
    return {
      ...acc,
      [`/apps/${appName}`]: { host: `${protocol}://localhost:${appPort}` },
      [`/insights/${appName}`]: { host: `${protocol}://localhost:${appPort}` },
      [`/preview/insights/${appName}`]: {
        host: `${protocol}://localhost:${appPort}`,
      },
      [`/preview/apps/${appName}`]: {
        host: `${protocol}://localhost:${appPort}`,
      },
    };
  }, {}),
};
