// webpack.config.js
const path = require('path');
const webpack = require('webpack');

module.exports = {
  // Your entry point file (adjust the path as needed)
  entry: './src/index.js',

  // Output bundle configuration
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  // Configure how modules are resolved
  resolve: {
    fallback: {
      // Provide fallbacks for Node.js core modules
      zlib: require.resolve('browserify-zlib'),
      querystring: require.resolve('querystring-es3'),
      buffer: require.resolve('buffer/'),
      path: require.resolve('path-browserify'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
      net: false, // Not needed in browser
      fs: false,  // Not needed in browser
      util: require.resolve('util/'),
      url: require.resolve('url/'),
    },
  },

  // Use plugins to provide global variables that some modules expect
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ],

  // Module rules (e.g., using Babel for ES6+ code)
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Adjust if you're using a different loader
        },
      },
    ],
  },

  // Other configuration options...
  mode: 'development', // or 'production'
};
