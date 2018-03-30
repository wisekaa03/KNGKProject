/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

// Browser dev server.  This config will be used with `webpack-dev-server`
// to enable hot-reloading.  Sourcemaps and full debugging is enabled.

// ----------------------
// IMPORTS

/* NPM */
import webpack from 'webpack';
import WebpackConfig from 'webpack-config';

// Chalk terminal library
import chalk from 'chalk';

/* Local */

// Import console messages
import { css, stats } from '../config';
import { logServerStarted } from '../lib/console';

// Local paths
import PATHS from '../paths';
import config from '../../src/config';

// ----------------------

// Host and port settings to spawn the dev server on
// const LOCAL = `http://${HOST}:${PORT}/`;

export default new WebpackConfig()
  .extend([
    '[root]/webpack.client.js',
    //* : conf =>
    // // Add `webpack-dev-server` polyfills needed to communicate with the browser

    // conf.entry.client.unshift(
    //   'react-hot-loader/patch',
    //   `webpack-dev-server/client?${LOCAL}`,
    //   'webpack/hot/only-dev-server',
    // );

    // // Add React-specific hot loading
    // conf.module.rules
    //   .find(l => l.test.toString() === /\.jsx?$/.toString())
    //   .use.unshift({
    //     loader: 'react-hot-loader/webpack',
    //   });

    //      conf
    //   ,
    // },
    '[root]/webpack.development.js',
  ])
  .merge({
    module: {
      rules: [
        // CSS loaders
        ...css.getDevLoaders(),
      ],
    },

    // Dev server configuration
    devServer: {
      // bind our dev server to the correct host and port
      host: config.host,
      port: config.port,

      // link HTTP -> app/public, so static assets are being pulled from
      // our source directory and not the `dist/public` we'd normally use in
      // production.  Use `PATH.views` as a secondary source, for serving
      // the /webpack.html fallback
      contentBase: [PATHS.static, PATHS.views],

      // Enables compression to better represent build sizes
      compress: true,

      // Assume app/public is the root of our dev server
      publicPath: '',

      // Inline our code, so we wind up with one, giant bundle
      inline: true,

      // Hot reload FTW! Every change is pushed down to the browser
      // with no refreshes
      hot: true,

      // Disable build's information
      noInfo: false,

      // Show a full-screen overlay in the browser when there is a
      // compiler error
      overlay: true,

      // We're using React Router for all routes, so redirect 404s
      // back to the webpack-dev-server bootstrap HTML
      historyApiFallback: {
        index: '/webpack.html',
      },

      // Allow any origins, for use with Docker or alternate hosts, etc
      headers: {
        'Access-Control-Allow-Origin': '*',
      },

      // Format output stats
      stats,
    },

    // Extra output options, specific to the dev server -- source maps and
    // our public path
    output: {
      publicPath: '/assets/', // `${LOCAL}`,
    },

    plugins: [
      // Log to console when `server.js` has finished
      {
        apply(compiler) {
          compiler.plugin('done', () => {
            logServerStarted({
              type: 'hot-reloading client',
              host: config.host,
              port: config.port,
              chalk: chalk.bgMagenta.white,
              allowSSL: false,
            });
          });
        },
      },

      new webpack.NamedModulesPlugin(),

      // Activate the hot-reloader, so changes can be pushed to the browser
      // new webpack.HotModuleReplacementPlugin(),

      // Global variables
      new webpack.DefinePlugin({
        // We're not running on the server
        SERVER: false,
        'process.env': {
          // Point the server host/port to the dev server
          HOST: JSON.stringify(config.host),
          PORT: JSON.stringify(config.port),
          SSL_PORT: JSON.stringify(config.port_ssl),

          // Debug development
          NODE_ENV: JSON.stringify('development'),
          DEBUG: true,
        },
      }),
    ],
  });
