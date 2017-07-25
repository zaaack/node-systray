import test from 'ava'
import os from 'os'
import path from 'path'
import SysTray from '../lib/index'
// temporarily fix https://github.com/babel/babel/issues/6093
const regeneratorRuntime = require('babel-runtime/regenerator')

const menu = require('./menu.json')
const pkg = require('../package.json')

test('systray debug is ok', async t => {
  const systray = new SysTray({ menu, debug: true })
  systray.onClick(action => {
    if (action.seq_id === 0) {
      systray.sendAction({
        type: 'update-item',
        item: {
          ...(action.item),
          checked: !action.item.checked,
        },
        seq_id: action.seq_id,
      })
    } else if (action.seq_id === 2) {
      systray.kill()
    }
    console.log('action', action)
  })
  await new Promise(resolve => systray.onReady(resolve))
  let {code, signal} = await new Promise<{code: number | null, signal: string | null}>(resolve => systray.onExit((code, signal) => resolve({code, signal})))
  console.log('code', code, 'signal', signal)
  t.is(code, null)
  t.is(signal, 'SIGTERM')
})

test('systray release is ok', async t => {
  const systray = new SysTray({ menu, debug: false })
  systray.onClick(action => {
    if (action.seq_id === 0) {
      systray.sendAction({
        type: 'update-item',
        item: {
          ...(action.item),
          checked: !action.item.checked,
        },
        seq_id: action.seq_id,
      })
    } else if (action.seq_id === 2) {
      systray.kill()
    }
    console.log('action', action)
  })
  await new Promise(resolve => systray.onReady(resolve))
  let {code, signal} = await new Promise<{code: number | null, signal: string | null}>(resolve => systray.onExit((code, signal) => resolve({code, signal})))
  console.log('code', code, 'signal', signal)
  t.is(code, null)
  t.is(signal, 'SIGTERM')
})

test('systray copyDir is ok', async t => {
  const debug = false
  const systray = new SysTray({ menu, debug, copyDir: true })
  const binName = ({
    win32: `tray_windows${debug ? '' : '_release'}.exe`,
    darwin: `tray_darwin${debug ? '' : '_release'}`,
    linux: `tray_linux${debug ? '' : '_release'}`,
  })[process.platform]
  t.is(systray.binPath, path.resolve(`${os.homedir()}/.cache/node-systray/`, pkg.version, binName))
  systray.onClick(action => {
    if (action.seq_id === 0) {
      systray.sendAction({
        type: 'update-item',
        item: {
          ...(action.item),
          checked: !action.item.checked,
        },
        seq_id: action.seq_id,
      })
    } else if (action.seq_id === 2) {
      systray.kill()
    }
    console.log('action', action)
  })
  await new Promise(resolve => systray.onReady(resolve))
  let {code, signal} = await new Promise<{code: number | null, signal: string | null}>(resolve => systray.onExit((code, signal) => resolve({code, signal})))
  console.log('code', code, 'signal', signal)
  t.is(code, null)
  t.is(signal, 'SIGTERM')
})
