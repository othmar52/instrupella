const { defineConfig } = require('@vue/cli-service')
const path = require('path')

const musicFilesSymlinkSource = process.env.VUE_APP_MUSIC_ABSPATH
let musicFilesSymlinkTarget = ''
if (process.env.NODE_ENV === 'development') {
  musicFilesSymlinkTarget = `public/${musicFilesSymlinkSource.split(/\//).pop()}`
}
if (process.env.NODE_ENV === 'production') {
  musicFilesSymlinkTarget = `dist/${musicFilesSymlinkSource.split(/\//).pop()}`
}
const symlinkList = []
if (musicFilesSymlinkTarget !== '') {
  symlinkList.push({
    src: musicFilesSymlinkSource,
    dest: musicFilesSymlinkTarget
  })
}
const WebpackSymlinkPlugin = require('webpack-symlink-plugin')
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
    },
    plugins: [
      new WebpackSymlinkPlugin({
        symlinkList: symlinkList
      })
    ]
    /*
    // TODO: how to tell dev server to ignore symlinked music collection?
    // to avoid memory issues in dev server
    devServer: {
      watchFiles: {
        options: {
          followSymlinks: false,
        }
      },
      static: {
        directory: path.join(__dirname, musicFilesSymlinkTarget),
        watch: {
          followSymlinks: false,
        },
      },
    },
    */
  }
  /*
  // TODO: how to exclude symlink from public dir for production build?
  chainWebpack: (config) => {
    config.resolve.symlinks(false)
  }
  */
})
