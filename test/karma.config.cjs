const resolve = require('@rollup/plugin-node-resolve').default

process.env.CHROME_BIN = require('chromium').path

module.exports = function (config) {
  config.set({
    basePath: '..',
    frameworks: ['mocha', 'chai'],
    files: [
      {pattern: 'lib/*.js', type: 'module', included: false},
      {pattern: 'node_modules/**', type: 'module', included: false},
      {pattern: 'test/*', type: 'module', included: true, watched: false}
    ],
    preprocessors: {
      'test/*.ts': ['rollup']
    },
    rollupPreprocessor: {
      plugins: [resolve()],
      output: {
        format: 'iife',
        name: 'test',
        sourcemap: 'inline'
      }
    },
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: process.platform === 'darwin' ? ['ChromeHeadless', 'SafariNative'] : ['ChromeHeadless'],
    autoWatch: false,
    singleRun: true,
    concurrency: Infinity
  })
}
