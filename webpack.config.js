const webpack = require('webpack')

const testConfig = {
  context: __dirname + '/test-web',
  entry: './test-pre-build.js',
  output: {
    path: __dirname + '/test-web',
    filename: 'test-build.js'
  }
}

const prodConfig = {
  context: __dirname + '/lib',
  entry: './vCard.js',
  output: {
    path: __dirname + '/dist',
    filename: 'vcard-creator.js',
    library: 'vcard_creator',
    libraryTarget: 'umd',
    globalObject: 'typeof self !== \'undefined\' ? self : this'
  }
}

module.exports = process.env.NODE_ENV === 'development' ? testConfig : prodConfig;
