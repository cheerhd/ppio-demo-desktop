// Cannot call instance method to mutate its props
// Must be in vuex mutations
// ALERT: Do not add instance methods, those will not be in storage.

import filesize from 'filesize'
import {
  TASK_TYPE_UPLOAD,
  TASK_TYPE_DOWNLOAD,
  TASK_TYPE_GET,
} from '../../constants/store'
import { TASK_GET_PROGRESS_INTERVAL } from '../../constants/constants'
import {
  TASK_STATUS_RUNNING,
  TASK_STATUS_FAIL,
  TASK_STATUS_SUCC,
  TASK_STATUS_PAUSED,
} from '../../constants/task'

export class Task {
  transferredData

  constructor(initData) {
    if (initData instanceof Task) {
      return initData
    }
    if (!initData || !initData.id || !initData.type) {
      throw new Error('invalid task data')
    }
    console.log('creating new task with: ')
    console.log(initData)
    this.type = initData.type
    this.id = initData.id
    this.file = initData.file || null
    this.lastTransferredData = initData.transferredData || 0 // used to calculate transfer speed
    this.transferredData = initData.transferredData || 0 // transferred bytes
    this.wholeDataLength = initData.wholeDataLength || 0 // whole file size
    this.transferSpeed = 0 // transfer speed, bytes/s
    this.displayTransferSpeed = '0b/s' // transfer speed for display
    this.finished = initData.finished || false
    this.status = initData.status || TASK_STATUS_RUNNING
    this.failMsg = initData.failMsg || ''
    console.log(this.status)
  }

  get transferProgress() {
    if (this.wholeDataLength === 0) {
      return 0
    }
    console.log(
      `calculating transfer progress: ${this.transferredData}, ${this.wholeDataLength}`,
    )
    return (this.transferredData * 100) / this.wholeDataLength
  }

  setTransferredData(length) {
    console.log('setting transferred data: ', this.lastTransferredData, length)
    if (length > 0 && length > this.transferredData) {
      this.transferredData = length
      const speed = Math.round(
        (length - this.lastTransferredData) / (TASK_GET_PROGRESS_INTERVAL / 1000),
      )
      this.setTransferSpeed(speed)
      this.lastTransferredData = length
    } else {
      console.log('transfer backed')
      this.transferredData = length
      this.setTransferSpeed(0)
      this.lastTransferredData = length
    }
  }

  setTransferSpeed(speed) {
    console.log('setting transfer speed:', speed)
    this.displayTransferSpeed = `${filesize(speed)}/s`
    this.transferSpeed = speed
    console.log('computed speed: ', this.transferSpeed)
  }

  setStatus(status) {
    console.log('status set', status)
    if (status === TASK_STATUS_SUCC || status === TASK_STATUS_FAIL) {
      this.finished = true
      this.setTransferSpeed(0)
    }
    if (status === TASK_STATUS_PAUSED) {
      this.setTransferSpeed(0)
    }
    this.status = status
  }

  setProgress(progress) {
    console.log('setting transfer progress')
    console.log(progress)
    this.setTransferredData(progress.transferredData)
    this.wholeDataLength = progress.wholeDataLength
  }
  // TODO: for test
  pause() {
    console.log('task paused')
    this.setStatus(TASK_STATUS_PAUSED)
  }

  resume() {
    console.log('task resumed')
    this.setStatus(TASK_STATUS_RUNNING)
  }

  finish() {
    console.log('task finished succ')
    this.setStatus(TASK_STATUS_SUCC)
  }

  fail(failMsg) {
    console.log('task failed')
    this.setStatus(TASK_STATUS_FAIL)
    this.failMsg = failMsg
  }
}

export class UploadTask extends Task {
  constructor(initData) {
    console.log('create new UploadTask')
    console.log(initData)
    if (initData instanceof UploadTask) {
      return initData
    }
    if (!initData || !initData.localPath) {
      throw new Error('invalid upload task init data')
    }
    super(Object.assign(initData, { type: TASK_TYPE_UPLOAD }))
    this.localPath = initData.localPath
  }
}

export class DownloadTask extends Task {
  constructor(initData) {
    console.log('create new DownloadTask')
    console.log(initData)
    if (initData instanceof DownloadTask) {
      return initData
    }
    if (!initData || !initData.exportPath) {
      throw new Error('invalid download task init data')
    }
    super(Object.assign(initData, { type: TASK_TYPE_DOWNLOAD }))
    this.exportPath = initData.exportPath
  }
}

export class GetTask extends Task {
  constructor(initData) {
    if (!initData || !initData.localPath) {
      throw new Error('invalid upload task init data')
    }
    super(Object.assign(initData, { type: TASK_TYPE_GET }))
  }
}
