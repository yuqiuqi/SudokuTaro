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
  h5: {
    publicPath: '/',
    devServer: {
      static: false,
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
      },
    },
  },
}) as UserConfigExport
