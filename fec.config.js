const { resolve } = require('path');
const packageJson = require('./package.json');

const bundle = 'insights';
const appName = packageJson[bundle].appname;

module.exports = {
  appName,
  appUrl: '/insights/remediations',
  useProxy: process.env.PROXY === 'true',
  moduleFederation: {
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
