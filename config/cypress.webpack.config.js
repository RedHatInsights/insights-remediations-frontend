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
        test: /\.(?:js|mjs|cjs)$/,
        exclude: /(node_modules|bower_components)/i,
        use: ['babel-loader'],
      },
    ],
  },
};
