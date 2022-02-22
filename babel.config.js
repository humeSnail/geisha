module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                modules: false,
                useBuiltIns: false
            }
        ],
        '@babel/preset-typescript'
    ],
    plugins: [
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        // ['@babel/proposal-class-properties', { loose: true }],
        // ['@babel/proposal-object-rest-spread', { loose: true }],
        '@babel/plugin-transform-runtime'
    ],
    env: {
        test: {
            presets: [
                [
                    '@babel/preset-env',
                    {
                        modules: 'commonjs',
                        useBuiltIns: false
                    }
                ]
            ]
        }
    }
};
