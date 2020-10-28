const path = require('path')
// const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin')

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
          presets: ['@babel/preset-env'],
          plugins: [
            /**
             * 当我们有很多需要编译的文件的时候，每个文件中都会有这些方法的定义，这样整个包就会很大。
             * runtime把这些方法抽离到一个公共的地方，所以可以让我们打包出来的源码变小。
             */
            // [
            //   '@babel/plugin-transform-runtime',
            //   {
            //     'absoluteRuntime': false,
            //     'corejs': false,
            //     'helpers': true,
            //     'regenerator': true,
            //     'useESModules': false
            //   }
            // ]
          ]
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
  optimization: {
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
  },
  plugins: [
    new CompressionPlugin({
      test: /\.js/
    })
  ],
  node: {
    fs: 'empty',
    child_process: 'empty'
  }
}
