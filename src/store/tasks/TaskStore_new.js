import {
  DL_TASK,
  UL_TASK,
  GET_TASK,
  MUT_CLEAR_TASK_DATA,
  MUT_REPLACE_STATE_HOOK,
  TASK_TYPE_UPLOAD, TASK_TYPE_DOWNLOAD, TASK_TYPE_GET,
} from '../../constants/store'
import { DownloadTask, UploadTask } from './Task'

export default class TaskStore {
  constructor(storeType) {
    // assign keys and sdk methods by store type
    let STORE_KEYS
    if (storeType === 'upload') {
      STORE_KEYS = UL_TASK
    }
    if (storeType === 'download') {
      STORE_KEYS = DL_TASK
    }

    if (storeType === 'get') {
      STORE_KEYS = GET_TASK
    }

    const m_setTaskProgress = (state, payload) => {
      console.log('setting task progress')
      console.log(state.taskQueue[payload.idx])
      state.taskQueue[payload.idx].setProgress(payload)
    }

    const m_pauseTask = (state, idx) => {
      console.log('pausing task')
      console.log(state.taskQueue[idx])
      state.taskQueue[idx].pause()
    }

    const m_resumeTask = (state, idx) => {
      state.taskQueue[idx].resume()
    }

    const m_failTask = (state, payload) => {
      const taskToFail = state.taskQueue[payload.idx]
      console.log('failing task')
      console.log(taskToFail)
      taskToFail.fail(payload.msg)
      state.finishedQueue.unshift(taskToFail)
      state.taskQueue.splice(payload.idx, 1)
    }

    const m_finishTask = (state, idx) => {
      console.log('finishing task ', idx)
      const taskToFinish = state.taskQueue[idx]
      taskToFinish.finish()
      state.finishedQueue.unshift(taskToFinish)
      state.taskQueue.splice(idx, 1)
    }

    const m_removeTask = (state, idx) => {
      console.log('removing task ', idx)
      state.finishedQueue.splice(idx, 1)
    }

    const m_cancelTask = (state, idx) => {
      console.log('canceling task', idx)
      state.taskQueue.splice(idx, 1)
    }

    const m_setTaskStatus = (state, statusArr) => {
      console.log('mutate task status')
      console.log(statusArr)
      statusArr.map((status, idx) => {
        if (status && state.taskQueue[idx]) {
          const task = state.taskQueue[idx]
          task.status = Object.assign(task.status, status)
          if (status.finished || status.failed) {
            state.finishedQueue.unshift(task)
            state.taskQueue.splice(idx, 1)
          }
        }
      })
    }
    // define store data
    const initialState = () => ({
      taskQueue: [], // maintains the task queue
      finishedQueue: [], // maintains finished task queue
    })

    this.state = initialState
    this.getters = {
      [STORE_KEYS.GET_TASK_COUNT]: state => state.taskQueue.length,
    }
    this.mutations = {
      [MUT_REPLACE_STATE_HOOK]: state => {
        console.log('replace state hook fired for task list')
        const taskConverter = task => {
          if (task.type === TASK_TYPE_UPLOAD) {
            return new UploadTask(task)
          } else if (task.type === TASK_TYPE_DOWNLOAD){
            return new DownloadTask(task)
          }
        }
        state.taskQueue = state.taskQueue.map(taskConverter)
        state.finishedQueue = state.finishedQueue.map(taskConverter)
      },
      [STORE_KEYS.MUT_SET_PROGRESS]: m_setTaskProgress,
      [STORE_KEYS.MUT_PAUSE_TASK]: m_pauseTask,
      [STORE_KEYS.MUT_FINISH_TASK]: m_finishTask,
      [STORE_KEYS.MUT_FAIL_TASK]: m_failTask,
      [STORE_KEYS.MUT_RESUME_TASK]: m_resumeTask,
      [STORE_KEYS.MUT_REMOVE_TASK]: m_removeTask,
      [STORE_KEYS.MUT_CANCEL_TASK]: m_cancelTask,
      [STORE_KEYS.MUT_SET_STATUS]: m_setTaskStatus,
      [MUT_CLEAR_TASK_DATA](state) {
        const initState = initialState()
        Object.keys(initState).forEach(key => {
          state[key] = initState[key]
        })
      },
    }
    this.actions = {}
  }
}
