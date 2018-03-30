/**
 * Server
 */

import chalk from 'chalk';

// KoaJS - server
import Koa from 'koa';
// import KoaRouter from 'koa-router';
// import session from 'koa-session';
import bodyParser from 'koa-bodyparser';

// Apollo Server
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';

import config from '../config';
import models from '../data/models';
import handleRenderer from './handleRenderer';
import router from './router';

// import sequilize from '../data/sequelize';

//-------------------------------
// Local

// Apollo
import myGraphQLSchema from '../data/schema';

/**
 * Start server code
 */
const app = new Koa();

// koaBody is needed just for POST.
app.use(bodyParser());

router.post('/graphql', graphqlKoa({ schema: myGraphQLSchema }));
router.get('/graphql', graphqlKoa({ schema: myGraphQLSchema }));

// GraphiQL is reachable on http://localhost:3000/graphiql
router.get(
  '/graphiql',
  graphiqlKoa({
    endpointURL: '/graphql', // a POST endpoint that GraphiQL will make the actual requests to
  }),
);

// Server code
app.use(handleRenderer);

app.use(router.routes());
app.use(router.allowedMethods());

//
// Launch the server
// -----------------------------------------------------------------------------
/* const promise =  */
models
  .sync()
  .then(() => {
    console.info(chalk.green(`==> Synching a database: ${config.databaseUrl}`));
  })
  .catch(err => console.error(chalk.red(`==> 😭  ${err}`)));

app.listen(config.port, config.host, err => {
  const url = `http://${config.host}:${config.port}`;
  if (err) console.error(chalk.red(`==> 😭  OMG!!! ${err}`));
  console.info(chalk.green(`==> 🌎  Listening at ${url}`));
});

//
// Hot Module Replacement
// -----------------------------------------------------------------------------
// if (module.hot) {
//   app.hot = module.hot;
//   module.hot.accept('./router');
// }
