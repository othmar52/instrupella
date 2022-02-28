const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: './',
  transpileDependencies: true,
  lintOnSave: false, // for development purposes,
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: ['sass-loader']
        }
      // ...
      ]
    }
  }
})
