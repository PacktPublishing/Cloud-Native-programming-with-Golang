module.exports = {
    entry: "./src/index.tsx",
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist"
    },

    devtool: "source-map",

    resolve: {
        extensions: [".ts", ".tsx", ".css", ".js"]
    },

    module: {
        /*loaders: [
            {
                test: /\.tsc?$/,
                loader: "awesome-typescript-loader"
            }
        ],*/

        rules: [
            {
                test: /\.tsx?$/,
                //loader: "awesome-typescript-loader"
                loader: "ts-loader"
            },
            {
                test: /.jsx?$/,
                loader: 'babel-loader',
                query: {
                    //presets: [['es2015', {}]]
                }
            },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },
            {
                test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=10000&mimetype=application/font-woff'
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'file-loader'
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
            }
            /*,
            {
                test: /\.js$/,
                enforce: "pre",
                loader: "source-map-loader"
            }*/
        ]
    },

    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    }
};