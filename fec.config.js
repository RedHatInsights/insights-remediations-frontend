const { resolve } = require('path');
const packageJson = require('./package.json');
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');

const bundle = 'insights';
const appName = packageJson[bundle].appname;

module.exports = {
  appName,
  appUrl: '/insights/remediations',
  useProxy: process.env.PROXY === 'true',
  devtool: 'hidden-source-map',
  plugins: [
    // Put the Sentry Webpack plugin after all other plugins
    ...(process.env.ENABLE_SENTRY
      ? [
          sentryWebpackPlugin({
            ...(process.env.SENTRY_AUTH_TOKEN && {
              authToken: process.env.SENTRY_AUTH_TOKEN,
            }),
            org: 'red-hat-it',
            project: 'remediations-rhel',
            release: process.env.SENTRY_RELEASE,
            include: path.resolve(__dirname, 'dist/js'),
            urlPrefix: '/apps/remediations/js',
            rewrite: true,
            moduleMetadata: ({ release }) => ({
              dsn: `https://5d7d7a7fb9032c5316f131dc8323137c@o490301.ingest.us.sentry.io/4508683233787904`,
              org: 'red-hat-it',
              project: 'remediations-rhel',
              release,
            }),
          }),
        ]
      : []),
  ],
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
        './src/modules/RemediationsButton.js',
      ),
      './RemediationWizard': resolve(
        __dirname,
        './src/modules/RemediationsModal/index.js',
      ),
      './NoDataModal': resolve(
        __dirname,
        './src/modules/RemediationsModal/NoDataModal.js',
      ),
    },
  },
};
