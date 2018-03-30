// ----------------------
// IMPORTS

const path = require('path');

// ----------------------

// Parent folder = project root
const root = path.join(__dirname, '..');

module.exports = {
  // Root project folder.  This is the current dir.
  root,

  // Kit. Project starter kit code.  You can edit these files, but be
  // aware that upgrading your starter kit could overwrite them
  // kit: path.join(root, 'src'),

  // Entry points.  This is where webpack will look for our browser.js,
  // server.js and vendor.js files to start building
  entryClient: path.join(root, 'src', 'client'),
  entryServer: path.join(root, 'src', 'server'),

  // Webpack configuration files
  webpack: path.join(root, 'build', 'webpack'),

  // Views for internal use
  // views: path.join(root, 'kit', 'views'),

  // Source path; where we'll put our application files
  src: path.join(root, 'src'),

  // Static files.  HTML, images, etc that can be processed by Webpack
  // before being moved into the final `dist` folder
  static: path.join(root, 'src', 'static'),

  // Dist path; where bundled assets will wind up
  dist: path.join(root, 'dist'),

  // Dist path for development; where dev assets will wind up
  distDev: path.resolve(root, 'dist', 'development'),

  // Public.  This is where our web server will start looking to serve
  // static files from
  public: path.join(root, 'dist', 'public'),
};
