import { BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import { APP_SCHEME } from '../constants/constants'

const isDevelopment = process.env.NODE_ENV !== 'production'

export default {
  navigateCache: null,
  window: null,
  createWindow(options) {
    console.log('createWindow')
    if (this.window !== null) {
      return this.window
    }
    console.log('creating new window')
    if (!options) {
      options = {}
    }
    this.window = new BrowserWindow(
      Object.assign(
        {
          width: 1000,
          height: 670,
          minWidth: 830,
          minHeight: 560,
          titleBarStyle: 'hidden',
          center: true,
        },
        options,
      ),
    )

    if (isDevelopment) {
      let url = ''
      if (options.routerPath) {
        url = `${process.env.WEBPACK_DEV_SERVER_URL}#/${options.routerPath}`
      } else if (this.navigateCache) {
        url = this.navigateCache
      } else {
        url = `${process.env.WEBPACK_DEV_SERVER_URL}#/splash`
      }
      this.window.loadURL(url)
      if (!process.env.IS_TEST) {
        this.window.webContents.openDevTools()
      }
    } else {
      createProtocol(APP_SCHEME)
      if (options.routerPath) {
        this.window.loadFile(`index.html#/${options.routerPath}`)
      } else if (this.navigateCache) {
        this.window.loadURL(this.navigateCache)
      } else {
        this.window.loadFile('index.html')
      }
    }

    this.window.webContents.on('did-navigate-in-page', () => {
      const currentUrl = this.window.webContents.getURL()
      console.log('window did navigated in page', currentUrl)
      if (currentUrl.match('home') !== null) {
        this.navigateCache = currentUrl
      }
    })

    this.window.on('closed', () => {
      console.log('window closed')
      this.window = null
      global.uploadTaskManager.startUpdating()
      global.downloadTaskManager.startUpdating()
    })

    return this.window
  },
  focusWindow() {
    if (this.window === null) {
      this.createWindow()
      this.window.show()
    } else {
      this.window.show()
    }
  },
}
