const path               = require('path');
const webpack            = require('webpack');
const Merge              = require('webpack-merge');
const BaseConfig         = require('./webpack.base.conf.js');
const CssAssetsPlugin    = require('optimize-css-assets-webpack-plugin');
const ExtractTextPlugin  = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = Merge(BaseConfig, {
  entry: {
    'pixelSwiper': './src/index.js',
    'pixelSwiper.worker': './src/calc.worker.js'
  },

  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'pixelSwiper'
  },

  module: {
    loaders: [
      {test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/},
    ]
  },

  devtool: '#source-map',

  plugins: [
    new CleanWebpackPlugin([path.join(__dirname, '../dist')],
      {root: path.join(__dirname, '../'), verbose: true, dry: false}),
    new ExtractTextPlugin('[name].css'),
    new webpack.LoaderOptionsPlugin({minimize: true, debug: false}),
    new webpack.DefinePlugin({'process.env': {NODE_ENV: '"production"'}}),
    new CssAssetsPlugin({
      cssProcessorOptions: {autoprefixer: false, discardComments: {removeAll: true}, safe: true},
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {warnings: false},
      sourceMap: true,
      mangle: false
    }),
  ]

});