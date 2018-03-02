/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
//const CopyWebpackPlugin = require('copy-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const webpack = require('webpack');
const paths = require('./paths');
const utils = require('./utils');

module.exports = ({ production = true, fast = false }) => ({
  bail: production,

  devtool: production ? (fast ? false : 'source-map') : 'cheap-module-source-map',
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js', '.json']
  },
  entry: {
    vendor: [
      !production && require.resolve('react-dev-utils/webpackHotDevClient'),
      !production && require.resolve('react-error-overlay'),
      'react',
      'react-dom'
    ].filter(Boolean),

    vsts: './src/main/js/app/integration/vsts/index.js'
  },
  output: {
    path: paths.vstsBuild,
    pathinfo: !production,
    publicPath: '/integration/vsts/',
    filename: production ? 'js/[name].[chunkhash:8].js' : 'js/[name].js',
    chunkFilename: production ? 'js/[name].[chunkhash:8].chunk.js' : 'js/[name].chunk.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /(node_modules|libs)/
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'awesome-typescript-loader',
            options: {
              transpileOnly: true,
              useBabel: true,
              useCache: true
            }
          }
        ]
      },
      production
        ? {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract({
              fallback: 'style-loader',
              use: [utils.cssLoader({ production, fast }), utils.postcssLoader()]
            })
          }
        : {
            test: /\.css$/,
            use: ['style-loader', utils.cssLoader({ production, fast }), utils.postcssLoader()]
          }
    ].filter(Boolean)
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({ name: 'vendor' }),

    production &&
      new ExtractTextPlugin({
        filename: production ? 'css/sonar.[chunkhash:8].css' : 'css/sonar.css'
      }),

    !production && new InterpolateHtmlPlugin({ WEB_CONTEXT: '' }),

    new HtmlWebpackPlugin({
      inject: false,
      template: paths.vstsHtml,
      minify: utils.minifyParams({ production, fast })
    }),

    /*new CopyWebpackPlugin([
      {
        from: paths.appNodeModules + '/vss-web-extension-sdk/lib/VSS.SDK.min.js',
        to: paths.jsBuild
      }
    ]),*/

    production &&
      !fast &&
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        compress: { screw_ie8: true, warnings: false },
        mangle: { screw_ie8: true },
        output: { comments: false, screw_ie8: true }
      }),

    !production && new webpack.HotModuleReplacementPlugin()
  ].filter(Boolean)
});
