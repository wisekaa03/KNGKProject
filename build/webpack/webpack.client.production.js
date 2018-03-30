/**
 * Client (webpack config)
 *
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import path from 'path';
import webpack from 'webpack';
// плагин нужен для генерация файла-манифеста, который будет использован
// фреймворком для подключения js и css
import AssetsPlugin from 'webpack-assets-manifest';

import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

// import overrideRules from './lib/overrideRules';
import config, {
  isDebug,
  isAnalyze,
  isVerbose,
  // reStyle,
  // reImage,
} from '../config';

const clientConfig = {
  ...config,

  name: 'client',
  target: 'web',

  entry: {
    client: ['@babel/polyfill', './src/client/client.js'],
  },

  optimization: {
    splitChunks: {
      chunks: 'async',
      name: 'vendor',
      // minChunks: /node_modules/.test(module.resource),
    },
  },

  plugins: [
    // Define free variables
    // https://webpack.js.org/plugins/define-plugin/
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': isDebug ? '"development"' : '"production"',
      'process.env.BROWSER': true,
      __DEV__: isDebug,
    }),

    // Emit a file with assets paths
    // https://github.com/sporto/assets-webpack-plugin#options
    new AssetsPlugin({
      path: path.resolve(__dirname, '../dist/client'),
      filename: 'assets.json',
      prettyPrint: true,
    }),

    // Move modules that occur in multiple entry chunks to a new entry chunk (the commons chunk).
    // https://webpack.js.org/plugins/commons-chunk-plugin/
    // new webpack.optimize.CommonsChunkPlugin({
    //  name: 'vendor',
    //  minChunks: module => /node_modules/.test(module.resource),
    // }),

    ...(isDebug
      ? []
      : [
          // Decrease script evaluation time
          // https://github.com/webpack/webpack/blob/master/examples/scope-hoisting/README.md
          new webpack.optimize.ModuleConcatenationPlugin(),

          // Minimize all JavaScript output of chunks
          // https://github.com/mishoo/UglifyJS2#compressor-options
          new webpack.optimize.UglifyJsPlugin({
            compress: {
              warnings: isVerbose,
              unused: true,
              dead_code: true,
              screw_ie8: true,
            },
            mangle: {
              screw_ie8: true,
            },
            output: {
              comments: false,
              screw_ie8: true,
            },
            sourceMap: true,
          }),
        ]),

    // Webpack Bundle Analyzer
    // https://github.com/th0r/webpack-bundle-analyzer
    ...(isAnalyze ? [new BundleAnalyzerPlugin()] : []),
  ],

  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  // https://webpack.js.org/configuration/node/
  // https://github.com/webpack/node-libs-browser/tree/master/mock
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
};

export default clientConfig;
