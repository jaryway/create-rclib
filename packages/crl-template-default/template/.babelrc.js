module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        targets: {
          browsers: ['>1%', 'last 4 versions', 'Firefox ESR', 'ie >= 11', 'iOS >= 8', 'Android >= 4'],
        },
      },
    ],
    ['react-app'],
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', {}],

    ['import', { libraryName: 'antd', style: true }, 'ant'],
    ['import', { libraryName: '@fregata/ui', libraryDirectory: 'es', style: true }, 'fregata'],
  ],
};
