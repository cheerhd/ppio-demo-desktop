// Cannot call instance method to mutate its props
// Must be in vuex mutations

export class PPFile {
  constructor(fileData) {
    if (fileData instanceof PPFile) {
      return fileData
    }
    if (!fileData.key) {
      throw new Error('invalid file params')
    }
    this.key = fileData.key
    this.bucket = fileData.bucket
    this.filename = fileData.filename || fileData.key.split('/').slice(-1)[0]
    this.size = fileData.size
    this.type = fileData.type || 'plain'
  }
}

export class HomeListFile extends PPFile {
  constructor(fileData) {
    if (fileData instanceof HomeListFile) {
      return fileData
    }
    if (!fileData.status) {
      throw new Error('invalid file params')
    }
    super(fileData)
    this.status = fileData.status
    this.metadata = fileData.metadata || null
    this.startTime = fileData.startTime || 0 // timestamp in seconds
    this.expireTime = fileData.expireTime || 0 // timestamp in seconds
    if (this.expireTime !== 0) {
      this.duration = this.expireTime - this.startTime
      if (this.startTime && this.duration) {
        this.daysLeft = Math.ceil(
          (this.startTime + this.duration - Math.round(Date.now() / 1000)) / 86400,
        )
      }
    } else {
      this.duration = 0
      this.daysLeft = -1
    }
  }
}

export class TaskFile extends PPFile {
  constructor(fileData) {
    if (TaskFile instanceof TaskFile) {
      return fileData
    }
    super(fileData)
  }
}
