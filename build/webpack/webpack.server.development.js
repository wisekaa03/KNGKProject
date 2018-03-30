/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

// Server-side bundle for development.  Just like the production bundle, this
// runs on localhost:4000 by default, with two differences;
//
// 1) No files are emitted. This bundle runs in memory.
// 2) The server is re-bundled / re-started on every code change.

// ----------------------
// IMPORTS

/* Node */
import path from 'path';
// import chalk from 'chalk';
// import childProcess from 'child_process';

/* NPM */

import webpack from 'webpack';
import WebpackConfig from 'webpack-config';

import StartServerPlugin from 'start-server-webpack-plugin';

// In dev, we inlined stylesheets inside our JS bundles.  Now that we're
// building for production, we'll extract them out into a separate .css file
// that can be called from our final HTML.  This plugin does the heavy lifting
import ExtractTextPlugin from 'extract-text-webpack-plugin';

// Copy files from `PATH.static` to `PATHS.distDev`
import CopyWebpackPlugin from 'copy-webpack-plugin';

/* Local */
import config from '../../src/config';
import { css } from '../config';
import PATHS from '../paths';
// import { logServerStarted } from '../lib/console';

// ----------------------

// Simple Webpack plugin for (re)spawning the development server after
// every build
// class ServerDevPlugin {
//   apply(compiler) {
//     compiler.plugin('done', () => {
//       if (this.server) this.server.kill();
//       this.server = childProcess.fork(path.resolve(PATHS.dist, 'server.js'), {
//         cwd: PATHS.dist,
//         silent: false,
//         execArgv: ['--inspect'],
//       });
//     });
//   }
// }

const extractCSS = new ExtractTextPlugin({
  filename: 'assets/css/style.css',
  allChunks: true,
});

export default [
  // Server bundle
  new WebpackConfig()
    .extend('[root]/webpack.development.js', '[root]/webpack.server.js')
    .merge({
      watch: true,
      stats: 'none',

      // Production server entry point
      entry: {
        server: [path.resolve(PATHS.entryServer, 'server.js')],
      },

      // Output to the `dist` folder
      output: {
        path: PATHS.dist,
        filename: '[name].development.js',
        chunkFilename: '[id].[hash:5]-[chunkhash:7].js',
      },

      plugins: [
        // {
        //   apply(compiler) {
        //     compiler.plugin('done', () => {
        //       logServerStarted({
        //         type: 'hot-reloading server',
        //         host: config.host,
        //         port: config.port,
        //         chalk: chalk.bgMagenta.white,
        //         allowSSL: false,
        //       });
        //     });
        //   },
        // },

        new webpack.DefinePlugin({
          // We ARE running on the server
          SERVER: true,
          'process.env': {
            // Point the server host/port to the production server
            HOST: JSON.stringify(config.host),
            PORT: JSON.stringify(config.port),
            SSL_PORT: JSON.stringify(config.port_ssl),
            // Debug development
            NODE_ENV: JSON.stringify('development'),
            DEBUG: true,
          },
        }),

        // Start the development server
        new StartServerPlugin({
          name: 'server.development.js',
          nodeArgs: ['--inspect-brk=127.0.0.1:9229'], // allow debugging
          // args: ['scriptArgument1', 'scriptArgument2'], // pass args to script
          signal: 'SIGUSR1', // false | true | 'SIGUSR2', // signal to send for HMR (defaults to `false`, uses 'SIGUSR2' if `true`)
          keyboard: true, // | false, // Allow typing 'rs' to restart the server. default: only if NODE_ENV is 'development'
        }),
      ],
    }),

  // Client bundle
  new WebpackConfig()
    .extend('[root]/webpack.development.js', '[root]/webpack.client.js')
    .merge({
      watch: true,
      stats: 'none',

      output: {
        path: PATHS.distDev,
        filename: '[name].js',
      },

      module: {
        rules: [
          // CSS loaders
          ...css.getExtractCSSLoaders(extractCSS, true /* sourceMaps = true */),
        ],
      },

      plugins: [
        // Client
        // {
        //   apply(compiler) {
        //     compiler.plugin('done', () => {
        //       logServerStarted({
        //         type: 'hot-reloading client',
        //         host: config.host,
        //         port: config.port,
        //         chalk: chalk.bgMagenta.white,
        //         allowSSL: false,
        //       });
        //     });
        //   },
        // },

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

        // Check for errors, and refuse to emit anything with issues
        new webpack.NoEmitOnErrorsPlugin(),

        // Fire up CSS extraction
        extractCSS,

        // Copy files from `PATHS.static` to `dist/dev`.  No transformations
        // will be performed on the files-- they'll be copied as-is
        new CopyWebpackPlugin([
          {
            from: PATHS.static,
            force: true, // This flag forces overwrites between versions
          },
        ]),
      ],
    }),
];
