/* eslint-disable */

const path = require('path');
const fs = require('fs');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);
const paths = require('react-scripts/config/paths');
const { override, useBabelRc, addLessLoader, addBabelPlugin } = require('customize-cra');
// const { addReactRefresh } = require('customize-cra-react-refresh');

// const isMicro = !!process.env.REACT_APP_MICRO;
const isEnvDevelopment = process.env.NODE_ENV === 'development';
const isEnvProduction = process.env.NODE_ENV === 'production';

module.exports = {
  webpack: override(
    useBabelRc(),
    // customize-cra plugins here
    isEnvProduction && addBabelPlugin(['transform-remove-console']),
    addLessLoader({
      sourceMap: true,
      lessOptions: {
        javascriptEnabled: true,
        // strictMath: true,
        // noIeCompat: true,
        modifyVars: {
          // "@primary-color": "#1DA57A", // for example, you use Ant Design to change theme color.
        },
      },
    })
    // isEnvDevelopment && addReactRefresh()
    // (config) => {
    //   //   console.log(paths);
    //   config.entry = {
    //     main: [
    //       'core-js/stable',
    //       'regenerator-runtime/runtime',
    //       // Include an alternative client for WebpackDevServer. A client's job is to
    //       // connect to WebpackDevServer by a socket and get notified about changes.
    //       // When you save a file, the client will either apply hot updates (in case
    //       // of CSS changes), or refresh the page (in case of JS changes). When you
    //       // make a syntax error, this client will display a syntax error overlay.
    //       // Note: instead of the default WebpackDevServer client, we use a custom one
    //       // to bring better experience for Create React App users. You can replace
    //       // the line below with these two lines if you prefer the stock client:
    //       // require.resolve('webpack-dev-server/client') + '?/',
    //       // require.resolve('webpack/hot/dev-server'),
    //       // isEnvDevelopment && require.resolve('react-dev-utils/webpackHotDevClient'),
    //       // Finally, this is your app's code:
    //       paths.appIndexJs,
    //       // We include the app code last so that if there is a runtime error during
    //       // initialization, it doesn't blow up the WebpackDevServer client, and
    //       // changing JS code would still trigger a refresh.
    //     ].filter(Boolean),
    //   };

    //   return config;
    // }
  ),
  // paths: function (paths, env) {
  //   // ...add your paths config
  //   paths.appTemplate = resolveApp('src/index.ejs');
  //   return paths;
  // },
  // devServer: (configFunction) => (proxy, allowedHost) => {
  //   const config = configFunction(proxy, allowedHost);
  //   return config;
  // },
};
