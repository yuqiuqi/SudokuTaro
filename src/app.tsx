import {PropsWithChildren} from 'react'
import {useLaunch} from '@tarojs/taro'

import {logRuntimeDiagnostics} from './utils/devDiagnostics'

import './app.scss'

function App({children}: PropsWithChildren) {
  useLaunch(() => {
    logRuntimeDiagnostics('app.useLaunch')
  })

  return children
}

export default App
