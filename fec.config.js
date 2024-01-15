module.exports = {
  appUrl: '/insights/remediations',
  debug: true,
  useProxy: true,
  proxyVerbose: true,
  interceptChromeConfig: false,
  plugins: [],
  hotReload: process.env.HOT === 'true',
  moduleFederation: {
    exclude: ['react-router-dom'],
    shared: [
      {
        'react-router-dom': {
          singleton: true,
          import: false,
          version: '^6.3.0',
          requiredVersion: '^6.3.0',
        },
      },
    ],
  },
};
