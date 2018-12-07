import moment from 'moment'
import { remote } from 'electron'
import { CANCEL_UPLOAD } from '../constants/sdk-methods'

const ppioUser = remote.getGlobal('ppioUser')

/**
 * @typedef {Object} UploadCost
 * @property {number} totalCost
 * @property {number} storageCost
 * @property {number} uploadCost
 */

/**
 * get upload cost from sdk
 * @param params
 * @returns {Promise<UploadCost>}
 */
export const getEstimateCost = params => {
  console.log('request upload file cost')
  console.log(params)
  return ppioUser
    .putCost({
      size: params.size,
      copies: params.copyCount,
      duration: params.storageTime,
    })
    .then(costs => {
      // The total upload cost contains two parts: storage and upload
      const totalCost = costs.reduce((acc, cur) => cur + acc, 0)
      const storageCost = costs[0]
      const uploadCost = totalCost - storageCost
      return { totalCost, storageCost, uploadCost }
    })
    .catch(err => {
      console.error('get upload cost fail')
      console.error(err)
      return Promise.reject(err)
    })
}

/**
 * start upload, returns object key for taskId
 * @param params
 * @param {object} params
 * @param {String} params.objectKey - file's key, use file name for now
 * @param {number} params.chiPrice - chi price
 * @param {number} params.copyCount - copies
 * @param {number} params.localPath - the file's path
 * @param {number} params.storageTime - time to storage, in seconds
 * @param {number} params.isSecure - whether to encrypt the file, enforced to be true in demo
 * @param {number} params.cpoolId - the coin pool's id to use
 * @returns {Promise<{taskId: string} | never>}
 */
export const startUpload = async params => {
  console.log('start upload service')
  console.log(params)
  return ppioUser
    .putObject({
      key: params.objectKey,
      body: params.localPath,
      copies: params.copyCount,
      expires: moment(Date.now() + params.storageTime).format('YYYY-MM-DD'),
      chiprice: params.chiPrice,
      encrypt: params.isSecure,
      'cpool-id': params.cpoolId,
    })
    .then(() => ({ taskId: params.objectKey }))
    .catch(err => {
      console.error('put object error')
      console.error(err)
      return Promise.reject(err)
    })
}

export const pauseUpload = params => {
  console.log('pausing upload')
  console.log(params)
  return ppioUser.pauseUpload()
}

export const resumeUpload = params => {
  console.log('resuming upload')
  console.log(params)
  return ppioUser.resumeUpload()
}

export const cancelUpload = taskId => ({
  method: CANCEL_UPLOAD,
  params: {
    taskId,
  },
})
