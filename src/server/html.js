/* eslint-disable react/no-danger, no-return-assign, no-param-reassign */

// Component to render the full HTML response in React

// ----------------------
// IMPORTS
// import React from 'react';
import { minify } from 'html-minifier';

// ----------------------

export default (helmet, scripts, css, window, cssServer, children) => {
  const html = `
  <!DOCTYPE html>
    <html
      prefix="og: http://ogp.me/ns#"
      ${helmet.htmlAttributes.toString()}
    >
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <!--[if IE]>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <![endif]-->

        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <base href="/" />

        ${helmet.title.toString()}
        ${helmet.meta.toString()}
        ${helmet.link.toString()}
        ${helmet.style.toString()}
        ${helmet.script.toString()}
        ${helmet.noscript.toString()}

        <!-- Roboto font -->
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500">

        <!-- Insert bundled css into <link> tag -->
        <link href="${css}" media="screen, projection" rel="stylesheet" type="text/css">

        <!-- Insert JSS server css -->
        <style id="jss">${cssServer}</style>
      </head>
      <body${
        helmet.bodyAttributes.toString()
          ? // eslint-disable-next-line prefer-template
            ' ' + helmet.bodyAttributes.toString()
          : ''
      }>
        <div id="root">${children}</div>

        <!-- Window STATE -->
        <script>${Object.keys(window)
          .map(key => `window.${key}=${JSON.stringify(window[key])};`)
          .join('')}</script>

        <!-- Insert bundled scripts into <script> tag -->
        ${Object.values(scripts)
          .map(key => `<script key="${key}" src="${key}"></script>`)
          .join('')}

      </body>
    </html>
  `;

  // html-minifier configuration, refer to "https://github.com/kangax/html-minifier" for more configuration
  const minifyConfig = {
    html5: true,
    collapseWhitespace: true,
    removeComments: true,
    trimCustomFragments: true,
    minifyCSS: true,
    minifyJS: false,
    minifyURLs: true,
  };

  // return html;
  return minify(html, minifyConfig);
};
