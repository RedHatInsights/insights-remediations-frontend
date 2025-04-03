const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');

const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
});

module.exports = {
  ...webpackConfig,
  plugins,
  module: {
    ...webpackConfig.module,
    rules: [
      ...webpackConfig.module.rules,
      {
        resolve: {
          alias: {
            '@redhat-cloud-services/frontend-components/useChrome': resolve(
              __dirname,
              './overrideChrome.js'
            ),
            '../useChrome': resolve(__dirname, './overrideChrome.js'),
          },
        },
      },
      {
        test: /\.(?:js|mjs|cjs)$/,
        exclude: /(node_modules|bower_components)/i,
        use: ['babel-loader'],
      },
    ],
  },
  resolve: {
    ...webpackConfig.resolve,
    fallback: {
      stream: require.resolve('stream-browserify'),
      zlib: require.resolve('browserify-zlib'),
    }
  }
};
