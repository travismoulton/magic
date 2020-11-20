const path = require('path');

module.exports = {
    mode: 'development',

    entry: './src/js/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'app', 'static', 'js'),
    },

    devtool: 'inline-source-map',

    module: {
        rules: [
            {
                test: /\.css$/,   
                use: [   
                'style-loader',   
                'css-loader',   
                ],   
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader'
                ],
            },
        ],
    },
};