var webpack = require('webpack');

var prodConfig = {
  context: __dirname + '/lib',
  entry: './vCard.js',
  output: {
    path: __dirname + '/dist',
    filename: 'vcard-creator.js',
    library: 'vcard-creator',
    libraryTarget: 'umd',
    globalObject: 'typeof self !== \'undefined\' ? self : this'
  }
};

module.exports = prodConfig;
