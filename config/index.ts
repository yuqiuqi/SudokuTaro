import {defineConfig, type UserConfigExport} from '@tarojs/cli'

export default defineConfig({
  projectName: 'SudokuTaro',
  date: '2026-4-5',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    375: 2,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-framework-react'],
  compiler: {
    type: 'webpack5',
    prebundle: {enable: false},
  },
  framework: 'react',
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {},
      },
    },
  },
  h5: {
    /** 与资源路径一致，避免子路径或预览工具请求错 publicPath */
    publicPath: '/',
    devServer: {
      // 避免对空 dist 目录走 serve-index 导致根路径异常
      static: false,
    },
  },
}) as UserConfigExport
