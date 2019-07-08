// Imports
const path = require('path')
const options = require('./babel.config')

const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production'
const libFolder = path.join(__dirname, 'lib')
const distFolder = path.join(__dirname, 'dist')
const testFolder = path.join(__dirname, 'test-web')

const testConfig = {
  mode,
  context: testFolder,
  entry: './test-pre-build.js',
  output: {
    path: testFolder,
    filename: 'test-build.js',
  },
}

const prodConfig = {
  mode,
  context: libFolder,
  entry: './VCard.js',
  resolve: {
    extensions: ['.js'],
  },
  output: {
    path: distFolder,
    filename: 'vcard-creator.js',
    library: 'vcardcreator',
    libraryTarget: 'umd',
    globalObject: `(typeof self !== 'undefined' ? self : this)`,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options,
        },
      },
    ],
  },
}

module.exports = mode === 'development' ? testConfig : prodConfig
