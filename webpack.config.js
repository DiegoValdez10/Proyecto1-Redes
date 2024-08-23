const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
    mode: 'development',
    entry: {
        index: './src/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist_webpack_babel'),
        filename: '[name].bundle.js',
    },
    module: {
      rules: [
        {
            test: /\.css$/,
            use: [
              MiniCssExtractPlugin.loader,
              'css-loader',
              {
                loader: 'postcss-loader',
                options: {
                  postcssOptions: {
                    plugins: [
                      require('autoprefixer'),
                      require('cssnano')({
                        preset: 'default',
                      })
                    ]
                  }
                }
              }
            ]
        },
        {
            test: /\.scss$/,
            use: [
                MiniCssExtractPlugin.loader,
                'css-loader',
                {
                  loader: 'postcss-loader',
                  options: {
                    postcssOptions: {
                      plugins: [
                        require('autoprefixer'),
                        require('cssnano')({
                          preset: 'default',
                        })
                      ]
                    }
                  }
                },
                'sass-loader'
            ]
        },
        {
            test: /\.(png|jpe?g|gif|svg|webp)$/i,
            use: [
                {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'images'
                    }
                }
            ]
        },
        {
            test: /\.mp4$/,
            use: [
                {
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]",
                        outputPath: "videos/"
                    }
                }
            ]
        },
        {
            test: /\.webm$/,
            use: [
                {
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]",
                        outputPath: "videos/"
                    }
                }
            ]
        },
        {
            test: /\.m?js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ["@babel/preset-env", "@babel/preset-react"]
                }
            }
        },
      ]
    },
    plugins: [
        new htmlWebpackPlugin({
            filename: 'index.html',
            template: './public/index.html',
            chunks: ['index']
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css'
        }),
        new CssMinimizerPlugin()
    ],
    optimization: {
        minimizer: [new CssMinimizerPlugin(),],
    },
};