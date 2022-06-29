const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');

const insightsProxy = {
  ...(process.env.BETA && { deployment: 'beta/apps' }),
  ...(process.env.LOCAL_API && {
    routes: {
      ...(process.env.LOCAL_API.split(',') || []).reduce((acc, curr) => {
        const [appName, appConfig] = (curr || '').split(':');
        const [appPort = 8003, protocol = 'http'] = appConfig.split('~');
        return {
          ...acc,
          [`/apps/${appName}`]: { host: `${protocol}://localhost:${appPort}` },
          [`/insights/${appName}`]: {
            host: `${protocol}://localhost:${appPort}`,
          },
          [`/beta/insights/${appName}`]: {
            host: `${protocol}://localhost:${appPort}`,
          },
          [`/beta/apps/${appName}`]: {
            host: `${protocol}://localhost:${appPort}`,
          },
        };
      }, {}),
    },
  }),
};

const webpackProxy = {
  deployment: process.env.BETA ? 'beta/apps' : 'apps',
  useProxy: true,
  env: process.env.CHROME_ENV ? process.env.CHROME_ENV : 'stage-stable',
  appUrl: process.env.BETA
    ? ['/beta/insights/remediations']
    : ['/insights/remediations'],
};

const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
  debug: true,
  ...(process.env.PROXY ? webpackProxy : insightsProxy),
});

plugins.push(
  require('@redhat-cloud-services/frontend-components-config/federated-modules')(
    {
      root: resolve(__dirname, '../'),
      useFileHash: false,
      exposes: {
        './RootApp': resolve(__dirname, '../src/AppEntry'),
        './RemediationButton': resolve(
          __dirname,
          '../src/modules/RemediationsButton.js'
        ),
        './RemediationWizard': resolve(
          __dirname,
          '../src/modules/RemediationsModal/index.js'
        ),
        './NoDataModal': resolve(
          __dirname,
          '../src/modules/RemediationsModal/NoDataModal.js'
        ),
      },
    }
  )
);

module.exports = {
  ...webpackConfig,
  plugins,
};
