const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');
const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
  https: false,
});

plugins.push(
  require('@redhat-cloud-services/frontend-components-config/federated-modules')(
    {
      root: resolve(__dirname, '../'),
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
