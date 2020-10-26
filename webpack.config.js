const path = require('path')
// const webpack = require('webpack')
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: 'production',
  entry: {
    app: path.join(__dirname, 'src'),
  },
  output: {
    filename: 'index.js',
    path: path.join(__dirname, 'dist'),
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.js']
  },
  module: {
    rules: [{
      test: /\.js$/,
      type: "javascript/esm",
      exclude: /(node_modules)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    }]
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    host: 'localhost',
    port: 8080
  },
  /**
   * uglifyjs-webpack-plugin 使用的 uglify-es 已经不再被维护，取而代之的是一个名为 terser 的分支。
   * 所以 webpack 官方放弃了使用 uglifyjs-webpack-plugin，建议使用 terser-webpack-plugin。
   */
  optimization:{
    minimize: true,
    minimizer:[
      new TerserPlugin({
        terserOptions: {
          include: /\/src/,
          compress: {
            pure_funcs: ["console.log"]
          }
        }
      })
    ]
  }
}
