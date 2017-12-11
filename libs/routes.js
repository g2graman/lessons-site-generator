import { readFileSync } from 'fs'
import { join } from 'path'
import { safeLoad } from 'js-yaml'

export default (targetDir) => {
  let routes
  let routesObj
  const file = join(targetDir, 'toc.yml')

  try {
    routes = readFileSync(file, 'utf8')
    routesObj = (safeLoad(routes))
  } catch (e) {
    throw new Error(`> No such toc.yml file exists as the document root: ${file}`)
  }

  return routesObj
}
