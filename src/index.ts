import * as child from 'child_process'
import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs-extra'
import * as EventEmitter from 'events'
import * as readline from 'readline'
import Debug from 'debug'

const pkg = require('../package.json')
const debug = Debug(pkg.name)

export type MenuItem = {
  title: string,
  tooltip: string,
  checked: boolean,
  enabled: boolean,
}

export type Menu = {
  icon: string,
  title: string,
  tooltip: string,
  items: MenuItem[],
}

export type ClickEvent = {
  type: 'clicked',
  item: MenuItem,
  seq_id: number,
}

export type ReadyEvent = {
  type: 'ready',
}

export type Event = ClickEvent | ReadyEvent

export type UpdateItemAction = {
  type: 'update-item',
  item: MenuItem,
  seq_id: number,
}

export type UpdateMenuAction = {
  type: 'update-menu',
  menu: Menu,
  seq_id: number,
}

export type UpdateMenuAndItemAction = {
  type: 'update-menu-and-item',
  menu: Menu,
  item: MenuItem,
  seq_id: number,
}

export type Action = UpdateItemAction | UpdateMenuAction | UpdateMenuAndItemAction

export type Conf = {
  menu: Menu,
  debug?: boolean,
  copyDir?: boolean | string
}

const getTrayBinPath = (debug: boolean = false, copyDir: boolean | string = false) => {
  const binName = ({
    win32: `tray_windows${debug ? '' : '_release'}.exe`,
    darwin: `tray_darwin${debug ? '' : '_release'}`,
    linux: `tray_linux${debug ? '' : '_release'}`,
  })[process.platform]
  const binPath = path.resolve(`${__dirname}/../traybin/${binName}`)
  if (copyDir) {
    copyDir = path.join((
      typeof copyDir === 'string'
        ? copyDir
        : `${os.homedir()}/.cache/node-systray/`), pkg.version)

    const copyDistPath = path.join(copyDir, binName)
    if (!fs.existsSync(copyDistPath)) {
      fs.ensureDirSync(copyDir)
      fs.copySync(binPath, copyDistPath)
    }

    return copyDistPath
  }
  return binPath
}
const CHECK_STR = ' (√)'
function updateCheckedInLinux(item: MenuItem) {
  if (process.platform !== 'linux') {
    return item
  }
  if (item.checked) {
    item.title += CHECK_STR
  } else {
    item.title = (item.title || '').replace(RegExp(CHECK_STR + '$'), '')
  }
  return item
}

export default class SysTray extends EventEmitter {
  protected _conf: Conf
  protected _process: child.ChildProcess
  protected _rl: readline.ReadLine
  protected _binPath: string

  constructor(conf: Conf) {
    super()
    this._conf = conf
    this._binPath = getTrayBinPath(conf.debug, conf.copyDir)
    this._process = child.spawn(this._binPath, [], {
      windowsHide: true
    })
    this._rl = readline.createInterface({
      input: this._process.stdout,
    })
    conf.menu.items = conf.menu.items.map(updateCheckedInLinux)
    this._rl.on('line', data => debug('onLine', data))
    this.onReady(() => this.writeLine(JSON.stringify(conf.menu)))
  }

  onReady(listener: () => void) {
    this._rl.on('line', (line: string) => {
      let action: Event = JSON.parse(line)
      if (action.type === 'ready') {
        listener()
        debug('onReady', action)
      }
    })
    return this
  }

  onClick(listener: (action: ClickEvent) => void) {
    this._rl.on('line', (line: string) => {
      let action: ClickEvent = JSON.parse(line)
      if (action.type === 'clicked') {
        debug('onClick', action)
        listener(action)
      }
    })
    return this
  }

  writeLine(line: string) {
    if (line) {
      debug('writeLine', line + '\n', '=====')
      this._process.stdin.write(line.trim() + '\n')
    }
    return this
  }

  sendAction(action: Action) {
    switch (action.type) {
      case 'update-item':
        action.item = updateCheckedInLinux(action.item)
        break
      case 'update-menu':
        action.menu.items = action.menu.items.map(updateCheckedInLinux)
        break
      case 'update-menu-and-item':
        action.menu.items = action.menu.items.map(updateCheckedInLinux)
        action.item = updateCheckedInLinux(action.item)
        break
    }
    debug('sendAction', action)
    this.writeLine(JSON.stringify(action))
    return this
  }
  /**
   * Kill the systray process
   * @param exitNode Exit current node process after systray process is killed, default is true
   */
  kill(exitNode = true) {
    if (exitNode) {
      this.onExit(() => process.exit(0))
    }
    this._rl.close()
    this._process.kill()
  }

  onExit(listener: (code: number | null, signal: string | null) => void) {
    this._process.on('exit', listener)
  }

  onError(listener: (err: Error) => void) {
    this._process.on('error', err => {
      debug('onError', err, 'binPath', this.binPath)
      listener(err)
    })
  }

  get killed() {
    return this._process.killed
  }

  get binPath() {
    return this._binPath
  }
}
