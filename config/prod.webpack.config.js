/* global require, module */

const _ = require('lodash');
const webpackConfig = require('./base.webpack.config');

module.exports = _.merge({},
    webpackConfig,
    require('./prod.webpack.plugins.js')
);
