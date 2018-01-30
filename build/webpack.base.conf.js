const webpack = require('webpack');

module.exports = {
  resolve: {
    extensions: ['.js'],
  },

  module: {
    loaders: [
      {test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/},
    ],
  },

  plugins: [],
};
