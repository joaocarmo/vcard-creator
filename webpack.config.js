/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const babelOptions = require('./babel.config')

const { NODE_ENV } = process.env

const mode = NODE_ENV || 'development'

const testConfig = {
  mode,
  context: path.join(__dirname, 'test-functional'),
  entry: './test-pre-build.js',
  output: {
    path: path.join(__dirname, 'test-functional'),
    filename: 'test-build.js',
  },
}

const prodConfig = {
  mode,
  context: path.join(__dirname, 'lib'),
  entry: './VCard.ts',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'vcard-creator.js',
    library: 'vcardcreator',
    libraryTarget: 'umd',
    globalObject: 'typeof self !== \'undefined\' ? self : this',
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.(j|t)s$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: babelOptions,
        },
      },
    ],
  },
}

module.exports = mode === 'development' ? testConfig : prodConfig
