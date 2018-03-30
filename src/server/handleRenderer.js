// React
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Helmet from 'react-helmet';

// Material-UI
import { SheetsRegistry } from 'react-jss/lib/jss';
import JssProvider from 'react-jss/lib/JssProvider';
import {
  MuiThemeProvider,
  createMuiTheme,
  createGenerateClassName,
} from 'material-ui/styles';
import CssBaseline from 'material-ui/CssBaseline';
import blue from 'material-ui/colors';

//-------------------------------
// Local

// HTML
import HTML from './html';
import App from '../components/App';

/**
 * Render
 */
function handleRender(ctx, next) {
  // Create a sheetsRegistry instance.
  const sheetsRegistry = new SheetsRegistry();

  // Create a theme instance.
  const theme = createMuiTheme({
    palette: {
      primary: blue,
      type: 'light',
    },
  });

  const generateClassName = createGenerateClassName();

  // Render the component to a string.
  const body = ReactDOMServer.renderToString(
    <JssProvider
      registry={sheetsRegistry}
      generateClassName={generateClassName}
    >
      <MuiThemeProvider theme={theme} sheetsManager={new Map()}>
        <CssBaseline />
        <App />
      </MuiThemeProvider>
    </JssProvider>,
  );

  // Grab the CSS from our sheetsRegistry.
  const cssServer = sheetsRegistry.toString();

  // CSS
  const css = '';

  // Send the rendered page back to the client.
  ctx.body = `<!DOCTYPE html>${HTML(
    Helmet.renderStatic(),
    /* scripts */ '',
    css,
    {
      webpackManifest: /* chunkManifest */ '',
      /* __APOLLO_STATE__: ctx.apollo.client.extract(), */
    },
    cssServer,
    body,
  )}`;
}

export default handleRender;
