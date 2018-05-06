import * as os from 'os'
import * as path from 'path'
import * as assert from 'assert'
import SysTray from '../src/index'
const menu = require('./menu.json')
const pkg = require('../package.json')
describe('test', function() {
  this.timeout(1000 * 24 * 3600)
  it('systray debug is ok', async () => {
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
    assert.equal(code, 0)
  })

  it('systray release is ok', async () => {
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
    assert.equal(code, 0)
    assert.equal(signal, null)
  })

  it('systray copyDir is ok', async () => {
    const debug = false
    const systray = new SysTray({ menu, debug, copyDir: true })
    const binName = ({
      win32: `tray_windows${debug ? '' : '_release'}.exe`,
      darwin: `tray_darwin${debug ? '' : '_release'}`,
      linux: `tray_linux${debug ? '' : '_release'}`,
    })[process.platform]
    assert.equal(systray.binPath, path.resolve(`${os.homedir()}/.cache/node-systray/`, pkg.version, binName))
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
    assert.equal(code, 0)
  })
})
