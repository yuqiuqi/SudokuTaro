import {readFileSync} from 'fs'
import {join} from 'path'

import {defineConfig, type UserConfigExport} from '@tarojs/cli'

function loadPackageJson(): {
  version?: string
  taroConfig?: {version?: string; desc?: string}
} {
  try {
    const raw = readFileSync(join(__dirname, '..', 'package.json'), 'utf-8')
    return JSON.parse(raw) as {
      version?: string
      taroConfig?: {version?: string; desc?: string}
    }
  } catch {
    return {}
  }
}

/** @tarojs/plugin-mini-ci 配置：凭据来自环境变量（见 .env.upload.example） */
function miniCiOptions() {
  const pkg = loadPackageJson()
  const tc = pkg.taroConfig
  const weapp =
    process.env.WECHAT_APPID && process.env.WECHAT_PRIVATE_KEY_PATH
      ? {
          appid: process.env.WECHAT_APPID,
          privateKeyPath: process.env.WECHAT_PRIVATE_KEY_PATH,
        }
      : undefined
  const tt =
    process.env.TT_EMAIL && process.env.TT_PASSWORD
      ? {
          email: process.env.TT_EMAIL,
          password: process.env.TT_PASSWORD,
        }
      : undefined

  return {
    version: process.env.CI_VERSION || tc?.version || pkg.version || '1.0.0',
    desc: process.env.CI_DESC || tc?.desc || 'SudokuTaro',
    weapp,
    tt,
  }
}

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
  plugins: [
    '@tarojs/plugin-framework-react',
    ['@tarojs/plugin-mini-ci', miniCiOptions()],
  ],
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
    publicPath: '/',
    devServer: {
      static: false,
    },
  },
}) as UserConfigExport
