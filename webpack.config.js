const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const bundleOutputDir = './wwwroot/dist';
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = (env) => {
    const isDevBuild = !(env && env.prod);
    const devMode = isDevBuild ? 'development' : 'production';

    return [{
        mode: devMode,
        stats: { modules: false },
        context: __dirname,
        resolve: { extensions: ['.js', '.ts'] },
        entry: { 'main': './ClientApp/boot.ts' },
        module: {
            rules: [
                { test: /\.vue\.html$/, include: /ClientApp/, loader: 'vue-loader', options: { loaders: { js: 'ts-loader' } } },
                {
                    test: /\.ts$/, include: /ClientApp/, use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                appendTsSuffixTo: [/\.vue\.html$/]
                            }
                        }
                    ]
                },
                // Compile CSS files
                // https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/701
                {
                    test: /\.css$/, use: [MiniCssExtractPlugin.loader, devMode ? "css-loader" : {
                        loader: "css-loader",
                        options: {
                            minimize: true
                        }
                    }]
                },
                // Compile SCSS files
                {
                    test: /\.scss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                    ].concat(
                        devMode ?
                            [
                                'css-loader', 'sass-loader'
                            ] :
                            [
                                {
                                    loader: 'css-loader', options: {
                                        minimize: true,
                                        sourceMap: true
                                    }
                                },
                                {
                                    loader: 'sass-loader', options: {
                                        sourceMap: true
                                    }
                                }
                            ]
                    )
                },
                { test: /\.(png|jpg|jpeg|gif|svg)$/, use: 'url-loader?limit=25000' }
            ]
        },
        output: {
            path: path.join(__dirname, bundleOutputDir),
            filename: '[name].js',
            publicPath: 'dist/'
        },
        plugins: [
            new VueLoaderPlugin(),
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify(isDevBuild ? 'development' : 'production')
                }
            }),
            new webpack.DllReferencePlugin({
                context: __dirname,
                manifest: require('./wwwroot/dist/vendor-manifest.json')
            }),
            new MiniCssExtractPlugin({
                // Options similar to the same options in webpackOptions.output
                // both options are optional
                filename: devMode ? 'site.css' : '[name].[hash].css',
            })
        ].concat(isDevBuild ? [
            // Plugins that apply in development builds only
            new webpack.SourceMapDevToolPlugin({
                filename: '[file].map', // Remove this line if you prefer inline source maps
                moduleFilenameTemplate: path.relative(bundleOutputDir, '[resourcePath]') // Point sourcemap entries to the original file locations on disk
            })
        ] : [
                // Plugins that apply in production builds only
                new UglifyJsPlugin()
            ])
    }];
};
