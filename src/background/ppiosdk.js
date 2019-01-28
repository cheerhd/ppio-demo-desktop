import path from 'path'
import Poss from 'poss-sdk'
import getPossBinFilename from '../utils/getPossBinFilename'

const possBinPath = path.join(
  path.dirname(__dirname),
  process.env.NODE_ENV === 'development' ? 'src/poss-bin' : 'extraResources',
  getPossBinFilename(),
)
console.log(possBinPath)

const possIns = new Poss({
  possExecutablePath: possBinPath,
  debug: false,
})
console.log('poss instance created')
console.log('poss path: ', possIns.possPath)

export default possIns
