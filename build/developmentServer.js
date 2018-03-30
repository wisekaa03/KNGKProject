/**
 * Develompent server (webpack config)
 *
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import path from 'path';
import webpack from 'webpack';
import Koa from 'koa';
// import serve from 'koa-static';
import KoaMiddleware from 'koa-webpack';

import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
// import errorOverlayMiddleware from 'react-dev-utils/errorOverlayMiddleware';

import webpackConfig from './webpack/webpack.config';
import run, { format } from './lib/run';
import clean from './lib/clean';

/**
 * Compiler helper function
 * @param {string} name Name: 'client' or 'server'
 * @param {Object} compiler Function that compiles
 * @param {Object} config Function what to compile
 */
function createCompilationPromise(name, compiler, config) {
  return new Promise((resolve, reject) => {
    let timeStart = new Date();
    compiler.plugin('compile', () => {
      timeStart = new Date();
      console.info(`[${format(timeStart)}] Compiling '${name}'...`);
    });
    compiler.plugin('done', stats => {
      console.info(stats.toString(config.stats));
      const timeEnd = new Date();
      const time = timeEnd.getTime() - timeStart.getTime();
      if (stats.hasErrors()) {
        console.info(
          `[${format(timeEnd)}] Failed to compile '${name}' after ${time} ms`,
        );
        reject(new Error('Compilation failed!'));
      } else {
        console.info(
          `[${format(
            timeEnd,
          )}] Finished '${name}' compilation after ${time} ms`,
        );
        resolve(stats);
      }
    });
  });
}

// https://webpack.js.org/configuration/watch/#watchoptions
const watchOptions = {
  // Watching may not work with NFS and machines in VirtualBox
  // Uncomment next line if it is your case (use true or interval in milliseconds)
  // poll: true,
  // Decrease CPU or memory usage in some file systems
  // ignored: /node_modules/,
};

let server;

/**
 * Launches a development web server with "live reload" functionality -
 * synchronizing URLs, interactions and code changes across multiple devices.
 */
async function develompentServer() {
  if (server) return server;
  server = new Koa();
  // server.use(errorOverlayMiddleware());
  // server.use(serve(path.resolve(__dirname, '../dist/client')));

  // Configure client-side hot module replacement
  const clientConfig = webpackConfig
    .find(config => config.get('name') === 'client')
    .toObject();
  // clientConfig.entry.client = ['./webpack/lib/webpackHotDevClient']
  //   .concat(clientConfig.entry.client)
  //   .sort((a, b) => b.includes('polyfill') - a.includes('polyfill'));
  clientConfig.output.filename = clientConfig.output.filename.replace(
    'chunkhash',
    'hash',
  );
  clientConfig.output.chunkFilename = clientConfig.output.chunkFilename.replace(
    'chunkhash',
    'hash',
  );
  clientConfig.module.rules = clientConfig.module.rules.filter(
    x => x.loader !== 'null-loader',
  );
  clientConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
  );

  // Configure server-side hot module replacement
  const serverConfig = webpackConfig
    .find(config => config.get('name') === 'server')
    .toObject();
  serverConfig.output.hotUpdateMainFilename = 'updates/[hash].hot-update.json';
  serverConfig.output.hotUpdateChunkFilename =
    'updates/[id].[hash].hot-update.js';
  serverConfig.module.rules = serverConfig.module.rules.filter(
    x => x.loader !== 'null-loader',
  );
  serverConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
  );

  // Configure compilation
  const multiCompiler = webpack([clientConfig, serverConfig]);
  const clientCompiler = multiCompiler.compilers.find(
    compiler => compiler.name === 'client',
  );
  const serverCompiler = multiCompiler.compilers.find(
    compiler => compiler.name === 'server',
  );
  const clientPromise = createCompilationPromise(
    'client',
    clientCompiler,
    clientConfig,
  );
  const serverPromise = createCompilationPromise(
    'server',
    serverCompiler,
    serverConfig,
  );

  // https://github.com/webpack/webpack-dev-middleware
  server.use(
    webpackDevMiddleware(clientCompiler, {
      publicPath: clientConfig.output.publicPath,
      logLevel: 'warn',
      serverSideRender: true,
      watchOptions,
    }),
  );

  // https://github.com/glenjamin/webpack-hot-middleware
  server.use(
    webpackHotMiddleware(clientCompiler, {
      // log: console.log,
      path: '__/webpack_hmr',
    }),
  );

  server.use(KoaMiddleware({ config: clientConfig }));

  let appPromise;
  let appPromiseResolve;
  let appPromiseIsResolved = true;
  serverCompiler.plugin('compile', () => {
    if (!appPromiseIsResolved) return;
    appPromiseIsResolved = false;
    // eslint-disable-next-line no-return-assign
    appPromise = new Promise(resolve => (appPromiseResolve = resolve));
  });

  let app = Object;

  server.use((req, res) => {
    appPromise
      .then(() => app.handle(req, res))
      .catch(error => console.error(error));
  });

  /**
   * Checks for update in server watch
   * @param {true} fromUpdate Update
   */
  function checkForUpdate(fromUpdate) {
    const hmrPrefix = '[\x1b[35mHMR\x1b[0m] ';

    if (!app.hot) {
      throw new Error(`${hmrPrefix}Hot Module Replacement is disabled.`);
    }
    if (app.hot.status() !== 'idle') {
      return Promise.resolve();
    }
    return app.hot
      .check(true)
      .then(updatedModules => {
        if (!updatedModules) {
          if (fromUpdate) {
            console.info(`${hmrPrefix}Update applied.`);
          }
          return;
        }
        if (updatedModules.length === 0) {
          console.info(`${hmrPrefix}Nothing hot updated.`);
        } else {
          console.info(`${hmrPrefix}Updated modules:`);
          updatedModules.forEach(moduleId =>
            console.info(`${hmrPrefix} - ${moduleId}`),
          );
          checkForUpdate(true);
        }
      })
      .catch(error => {
        if (['abort', 'fail'].includes(app.hot.status())) {
          console.warn(`${hmrPrefix}Cannot apply update.`);
          delete require.cache[require.resolve('../dist/server/server.js')];
          // eslint-disable-next-line global-require, import/no-unresolved
          app = require('../dist/server/server.js').default;
          console.warn(`${hmrPrefix}App has been reloaded.`);
        } else {
          console.warn(
            `${hmrPrefix}Update failed: ${error.stack || error.message}`,
          );
        }
      });
  }

  serverCompiler.watch(watchOptions, (error, stats) => {
    if (app && !error && !stats.hasErrors()) {
      checkForUpdate().then(() => {
        appPromiseIsResolved = true;
        appPromiseResolve();
      });
    }
  });

  // Wait until both client-side and server-side bundles are ready
  await clientPromise;
  await serverPromise;

  process.env.MESSAGES_DIR = path.join(__dirname, '../src/messages/');

  const timeStart = new Date();
  console.info(`[${format(timeStart)}] Launching server...`);

  // Load compiled src/server.js as a middleware
  // eslint-disable-next-line global-require, import/no-unresolved
  app = require('../dist/server/server.js').default;

  appPromiseIsResolved = true;
  appPromiseResolve();

  const timeEnd = new Date();
  const time = timeEnd.getTime() - timeStart.getTime();
  console.info(`[${format(timeEnd)}] Server launched after ${time} ms`);

  return server;
}

export default develompentServer;
