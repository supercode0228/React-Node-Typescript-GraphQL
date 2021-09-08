const path = require('path');
const withSass = require('@zeit/next-sass');

const deploymentType = (process.env.DEPLOYMENT_TYPE || 'local');
const RootUri = {
  'local': 'http://localhost:3000',
  'dev': 'https://staging.tests.com',
  'master': 'https://app.tests.com',
}[deploymentType];
const GraphQLUri = `${RootUri}/graphql`;

module.exports = withSass({
  /* config options here */
  cssModules: true,
  cssLoaderOptions: {
    importLoaders: 1,
    // localIdentName: "[local]___[hash:base64:5]",
    getLocalIdent: (loaderContext, localIdentName, localName, options) => {
      const fileName = path.basename(loaderContext.resourcePath);
      if(fileName.endsWith('.module.scss')) {
        const name = fileName.replace('.module.scss', '');
        if (name === localName) {
          return name;
        }

        if (localName[0] == localName[0].toLowerCase()) {
          return `${name}-${localName}`;
        } else {
          return `${name}__${localName}`;
        }
      } else {
        return localName;
      }
    }
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: {
        test: /\.(js|ts)x?$/,
      },
      use: ['svg-loader'],
    });

    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    // Important: return the modified config
    // config.plugins.push(new webpack.IgnorePlugin(/\/__tests__\//))
    // config.target = "node";
    // if(!isServer)
    //   config.node = { fs: "empty", net: "empty" };
    // config.externals = { fs: "fs", net: "net" };

    // // Ref: https://github.com/zeit/next.js/issues/544#issuecomment-269526908
    // config.module.rules.push({ test: /\.css$/, include: /node_modules/, loader: ['style-loader', 'css-loader', 'sass-loader'] });
    return config;
  },
  publicRuntimeConfig: {
    RootUri,
    GraphQLUri,
  }
});
