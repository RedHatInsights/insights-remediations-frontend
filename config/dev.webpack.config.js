const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');

const insightsProxy = {
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
  useProxy: true,
  env: process.env.CHROME_ENV
    ? process.env.CHROME_ENV
    : process.env.BETA
    ? 'stage-beta'
    : 'stage-stable', // pick chrome env ['stage-beta', 'stage-stable', 'prod-beta', 'prod-stable']
  appUrl: process.env.BETA
    ? ['/beta/insights/remediations', '/preview/insights/remediations']
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
      shared: [
        {
          'react-router-dom': { singleton: true, requiredVersion: '*' },
        },
      ],
    }
  )
);

module.exports = {
  ...webpackConfig,
  plugins,
};
