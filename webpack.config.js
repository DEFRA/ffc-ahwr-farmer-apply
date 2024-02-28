const path = require('path')

const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
const urlPrefix = '/apply'
console.log(`Running webpack in ${isDev ? 'development' : 'production'} mode`)

module.exports = {
  entry: './app/frontend/src/entry.js',
  mode: 'production', 
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: false,
              publicPath: '../'
            }
          },
          'css-loader',
          'resolve-url-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              sassOptions: {
                outputStyle: 'compressed'
              }
            }
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[contenthash][ext]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[contenthash][ext]'
        }
      }
    ]
  },
  output: {
    filename: 'js/[contenthash].js',
    path: path.resolve(__dirname, 'app/frontend/dist'),
    publicPath: `${urlPrefix}/assets/`
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      inject: false,
      filename: '../../views/layouts/layout.njk',
      template: 'app/views/layouts/_layout.njk',
      metadata: { urlPrefix }
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[contenthash].css'
    })
  ]
}
