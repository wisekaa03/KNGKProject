/* @flow */

import webpack from 'webpack';
import WebpackConfig from 'webpack-config';

export default [
  new WebpackConfig()
    .extend({
      'webpack/config/webpack.development.js': conf => {
        delete conf.debug;
        delete conf.devtool;
        delete conf.output.pathinfo;
        return conf;
      },
    })
    .merge({ name: 'server' }),

  new WebpackConfig().extend().merge({ name: 'client' }),
];
