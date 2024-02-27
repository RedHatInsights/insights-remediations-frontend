const { resolve } = require('path');

module.exports = {
  appUrl: '/insights/remediations',
  debug: true,
  useProxy: process.env.PROXY === 'true',
  proxyVerbose: true,
  interceptChromeConfig: false,
  plugins: [],
  hotReload: true,
  ...(process.env.port ? { port: parseInt(process.env.port) } : {}),
  moduleFederation: {
    exclude: ['react-router-dom'],
    shared: [
      {
        'react-router-dom': {
          singleton: true,
          import: false,
          version: '^6.8.1',
          requiredVersion: '^6.8.1',
        },
      },
    ],
    exposes: {
      './RootApp': resolve(__dirname, './src/AppEntry'),
      './RemediationButton': resolve(
        __dirname,
        './src/modules/RemediationsButton.js'
      ),
      './RemediationWizard': resolve(
        __dirname,
        './src/modules/RemediationsModal/index.js'
      ),
      './NoDataModal': resolve(
        __dirname,
        './src/modules/RemediationsModal/NoDataModal.js'
      ),
    },
  },
};
