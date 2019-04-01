const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production'

const testConfig = {
  mode,
  context: __dirname + '/test-web',
  entry: './test-pre-build.js',
  output: {
    path: __dirname + '/test-web',
    filename: 'test-build.js',
  },
}

const prodConfig = {
  mode,
  context: __dirname + '/lib',
  entry: './vCard.js',
  resolve: {
    extensions: ['.js'],
  },
  output: {
    path: __dirname + '/dist',
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
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    browsers: ['last 2 versions', 'ie >= 11'],
                  },
                },
              ],
            ],
          },
        },
      },
    ],
  },
}

module.exports = mode === 'development' ? testConfig : prodConfig
