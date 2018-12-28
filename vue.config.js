module.exports = {
  pages: {
    index: 'src/index/main.js',
  },
  devServer: {
    proxy: {
      '/cpool': {
        target: 'http://192.168.50.233:10001',
        changeOrigin: true,
        pathRewrite: {
          '^/cpool': '',
        },
      },
    },
  },
  chainWebpack: config => {
    config.plugin('define').tap(args => {
      return [
        {
          'process.env': {
            NODE_ENV: JSON.stringify(process.env.NODE_ENV),
            BASE_URL: args[0]['process.env'].BASE_URL,
            IS_CPOOL: JSON.stringify(process.env.IS_CPOOL),
          },
        },
      ]
    })
  },
  configureWebpack: {
    resolve: {
      symlinks: false,
    },
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        // options placed here will be merged with default configuration and passed to electron-builder
        // asar: false,
        asarUnpack: [
          '**/node_modules/poss-sdk/*',
          '**/src/background.js',
          '**/src/background/ppiosdk.js',
        ],
      },
    },
  },
}
