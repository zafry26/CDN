const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const CssNanoPlugin = require("cssnano");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = (env) => {
    const isDevBuild = !(env && env.prod);

    // Configuration in common to both client-side and server-side bundles.
    const sharedConfig = () => {

        var mode = isDevBuild ? "development" : "production";

        console.log('\x1b[36m%s\x1b[0m', "=== Webpack compilation mode: " + mode + " ===");

        var config = {
            mode,
            optimization: {
                minimize: !isDevBuild,
                usedExports: isDevBuild,
                minimizer: !isDevBuild ? [
                    // Production.
                    new TerserWebpackPlugin({
                        terserOptions: {
                            output: {
                                comments: false,
                            },
                        },
                    }),
                    new OptimizeCSSAssetsPlugin({
                        cssProcessor: CssNanoPlugin,
                        cssProcessorPluginOptions: {
                            preset: ["default", { discardComments: { removeAll: true } }]
                        }
                    })
                ] : [
                        // Development.
                    ]
            },
            stats: { modules: false },
            resolve: {
                extensions: ['.js', '.jsx', '.jpg', 'png'],
                alias: {
                    "@Layouts": path.resolve(__dirname, "ClientApp/layouts/"),
                    "@Components": path.resolve(__dirname, "ClientApp/components/"),
                    "@Images": path.resolve(__dirname, "ClientApp/images/"),
                    "@Store": path.resolve(__dirname, "ClientApp/store/"),
                    "@Utils": path.resolve(__dirname, "ClientApp/utils"),
                    "@Styles": path.resolve(__dirname, 'ClientApp/styles/'),
                    "@Pages": path.resolve(__dirname, 'ClientApp/pages/'),
                    "@Services": path.resolve(__dirname, 'ClientApp/services/'),
                    "@Models": path.resolve(__dirname, 'ClientApp/models/'),
                    "@Core": path.resolve(__dirname, 'ClientApp/core/'),
                    "@WebCastUtils": path.resolve(__dirname, "ClientApp/utils-webcast"),
                    "@Libs": path.resolve(__dirname, 'ClientApp/lib/')
                }
            },
            output: {
                filename: '[name].js',
                publicPath: 'dist/', // Webpack dev middleware, if enabled, handles requests for this URL prefix.
            },
            module: {
                rules: [
                    {
                        test: /\.jsx?$/, include: /ClientApp/,
                        use: [
                            {
                                loader: 'babel-loader',
                                options: {
                                    compact: true,
                                    plugins: [
                                    ]
                                },                    
                            }
                        ]
                    },
                    {
                        test: /\.(gif|png|jpe?g|svg)$/i,
                        use: [ 
                            {
                                loader: 'file-loader' ,
                                options: {
                                    name: `[path][name].[ext]`,
                                    // Output into parent folder's directory
                                    outputPath: url => url.slice(url.indexOf(`/`) + 1)
                              }
                        },]
                    },
                    {
                        test: /\.(woff|woff2|eot|ttf|otf)$/i,
                        use: [
                            {
                                loader: 'url-loader?limit=100000' ,
                                options: {
                                    name: `[path][name].[ext]`,
                                    // Output into parent folder's directory
                                    outputPath: url => url.slice(url.indexOf(`/`) + 1)
                                  }
                            },
                        ],
                    },

                ]
            },
            plugins: [
                // Moment.js is an extremely popular library that bundles large locale files
                // by default due to how Webpack interprets its code. This is a practical
                // solution that requires the user to opt into importing specific locales.
                // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
                // You can remove this if you don't use Moment.js:
                new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
            ].concat(isDevBuild ? [
                // Development.

                // Add module names to factory functions so they appear in browser profiler.
                new webpack.NamedModulesPlugin(),
                // Watcher doesn't work well if you mistype casing in a path so we use
                // a plugin that prints an error when you attempt to do this.
                // See https://github.com/facebookincubator/create-react-app/issues/240
                new CaseSensitivePathsPlugin(),
                // If you require a missing module and then `npm install` it, you still have
                // to restart the development server for Webpack to discover it. This plugin
                // makes the discovery automatic so you don't have to restart.
                // See https://github.com/facebookincubator/create-react-app/issues/186
                new WatchMissingNodeModulesPlugin(path.resolve(__dirname, '..', 'node_modules'))
            ] : [
                // Production.
            ])
        };

        if (isDevBuild) {

            // Change config for development build.

            config = {
                ...config,
                // Turn off performance hints during development because we don't do any
                // splitting or minification in interest of speed. These warnings become
                // cumbersome.
                performance: {
                    hints: false,
                },
                devtool: 'eval-source-map'
            };

            config.resolve.alias = {
                ...config.resolve.alias,
                'react-dom': '@hot-loader/react-dom'
            };
        }

        return config;
    };

    // Configuration for client-side bundle suitable for running in browsers.
    const clientBundleOutputDir = './wwwroot/dist';
    const clientBundleConfig = merge(sharedConfig(), {
        entry: { 'main-client': './ClientApp/boot-client.jsx' },
        module: {
            rules: [
                { test: /\.css$/, use: isDevBuild ? ['style-loader', 'css-loader'] : [MiniCssExtractPlugin.loader, 'css-loader'] },
                { 
                    test: /\.(scss|sass)$/, 
                    use: isDevBuild ? ['style-loader', 'css-loader', 'sass-loader'] : 
                    [
                        {
                            loader: MiniCssExtractPlugin.loader, 
                            options: {
                                publicPath: ''
                            }
                        },
                        {
                            loader: "css-loader", 
                            options: { sourceMap: true}
                        },{
                          loader: "sass-loader", 
                          options: { sourceMap: true }
                        }
                    ] 
                }
            ]
        },
        output: { 
            path: path.join(__dirname, clientBundleOutputDir) 
        },
        // Some libraries import Node modules but don't use them in the browser.
        // Tell Webpack to provide empty mocks for them so importing them works.
        node: {
            dgram: 'empty',
            fs: 'empty',
            net: 'empty',
            tls: 'empty',
            child_process: 'empty',
        },
        plugins: [
            new webpack.DllReferencePlugin({
                context: __dirname,
                manifest: require('./wwwroot/dist/vendor-manifest.json')
            })
        ].concat(isDevBuild ? [
            // Development.
            new webpack.SourceMapDevToolPlugin({
                filename: '[file].map', // Remove this line if you prefer inline source maps.
                moduleFilenameTemplate: path.relative(clientBundleOutputDir, '[resourcePath]') // Point sourcemap entries to the original file locations on disk
            })
        ] : [
            // Production.
            new MiniCssExtractPlugin({
                filename: "site.css"
            })
        ])
    });

    // Configuration for server-side (prerendering) bundle suitable for running in Node.
    const serverBundleConfig = merge(sharedConfig(), {
        module: {
            rules: [
                { test: /\.(scss|sass)$/, use: "ignore-loader" }
            ]
        },
        resolve: { mainFields: ['main'] },
        entry: { 'main-server': './ClientApp/boot-server.jsx' },
        plugins: [
            new webpack.DllReferencePlugin({
                context: __dirname,
                manifest: require('./ClientApp/dist/vendor-manifest.json'),
                sourceType: 'commonjs2',
                name: './vendor'
            })
        ],
        output: {
            libraryTarget: 'commonjs',
            path: path.join(__dirname, './ClientApp/dist')
        },
        target: 'node'
    });

    return [clientBundleConfig, serverBundleConfig];
};