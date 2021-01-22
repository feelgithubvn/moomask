'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');

const fs = require('fs');
const chalk = require('react-dev-utils/chalk');
const webpack = require('webpack');

const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const {
  createCompiler,
  prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');

const paths = require('../config/paths');
const configFactory = require('../config/webpackBackground.config');
const useYarn = fs.existsSync(paths.yarnLockFile);

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}
    
const isExtension = true;

const toUseFile = process.env.EXTENSION_FILE;

let appName = 'moomask';
let entryFilePath;
let outputFileName;

if(toUseFile === 'background') {
  appName = `${appName}-bg`;
  entryFilePath = paths.appBackgroundIndexJs;
  outputFileName = 'background.js'
} else if(toUseFile === 'content-script') {
  appName = `${appName}-cs`;
  entryFilePath = paths.appContentScriptJs;
  outputFileName = 'content-script.js'
} else {
  throw new Error("Specify file path please")
}

const config = configFactory('development', isExtension, entryFilePath, outputFileName);
const useTypeScript = fs.existsSync(paths.appTsConfig);
const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === 'true';

const devSocket = {
  warnings: warnings =>
    devServer.sockWrite(devServer.sockets, 'warnings', warnings),
  errors: errors =>
    devServer.sockWrite(devServer.sockets, 'errors', errors),
};

// Create a webpack compiler that is configured with custom messages.
const compiler = createCompiler({
  appName,
  config,
  devSocket,
  urls: false,
  useYarn,
  useTypeScript,
  tscCompileOnError,
  webpack,
});

new webpack.NodeEnvironmentPlugin().apply(compiler);
class LogPlugin {
  apply (compiler) {
      compiler.plugin('should-emit', compilation => {
          console.log('should i emit?');
          return true;
      })
      compiler.plugin('emit', (compilation, callback) => {
          console.log('Have I reached here?');
          callback()
      })
  }
} 

new LogPlugin().apply(compiler);

const watching = compiler.watch({
  // Example [watchOptions](/configuration/watch/#watchoptions)
  aggregateTimeout: 300,
  poll: undefined
}, (err, stats) => { // [Stats Object](#stats-object)
  // Print watch/build result here...
  //console.log(stats);
  if(err) {
    console.error("Unable to compile ")
    console.error(err)
    return;
  }
});

['SIGINT', 'SIGTERM'].forEach(function (sig) {
  process.on(sig, function () {
    watching.close();
  });
});

