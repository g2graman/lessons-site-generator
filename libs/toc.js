import fs from 'fs'
import { join, normalize, dirname, basename } from 'path'
import glob from 'glob'
import del from 'del'
import titleize from 'titleize'
import j2y from 'json2yaml'
import yaml from 'js-yaml'
import deepAssign from 'deep-assign'
import unslug from './unslug'

// simple object deep compare
const compare = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2)
}

// remove properties of source object that dest object have not attribute
const clean = (source, dest) => {
  for (let attr in source) {
    if (typeof source[attr] !== 'object') {
      if (dest && !dest.hasOwnProperty(attr)) {
        delete source[attr]
      }
    } else {
      clean(source[attr], dest[attr])
    }
  }

  return source
}

// clean merge after deep assign
const cleanMerge = (source, dest) => {
  let deep = deepAssign({}, source, dest)
  deep = clean(deep, dest)

  return deep
}

const gen = (docDir) => {
  let toc = {}
  const files = glob.sync(join(docDir, '**', '*.*'), {
    ignore: [join(docDir, 'node_modules', '**')],
    nodir: true
  })

  files
    .filter(file => /\.(md|markdown|mdown|mkdn|mkd|mdwn|mkdown)$/.test(file))
    .map(file => normalize(file))
    .filter(file => {
      return file !== join(docDir, 'readme.md') // basically readme.md is index file of directory
    })
    .forEach(file => {
      file = file.replace(docDir, '').substr(1, file.length)
      const dir = unslug(dirname(file))
      const name = unslug(basename(file).replace(/\.md$/, ''))

      /*
       * Parent Directory:
       *   Child Directory: File Path
       *
       * Basic:
       *   Getting Started: 'basic/getting-started.md'
       *
       */
      if (toc.hasOwnProperty(dir)) {
        toc[dir] = Object.assign(toc[dir], {
          [titleize(name)]: file
        })
      } else {
        toc = Object.assign(toc, {
          [titleize(dir)]: {
            [titleize(name)]: file
          }
        })
      }
    })

  return toc
}

export const updateTOC = (docDir) => {
  const tocFile = join(docDir, 'toc.yml')
  const has = fs.existsSync(tocFile)
  const json = gen(docDir)

  if (has) {
    let toc = fs.readFileSync(tocFile, 'utf8')
    let tocJson = yaml.safeLoad(toc)

    if (!compare(tocJson, json)) {
      save(tocFile, cleanMerge(tocJson, json))
    }
  }
}

const save = (file, json) => {
  fs.writeFileSync(file, j2y.stringify(json), {
    encoding: 'utf8'
  })
}

export const writeTOC = (docDir) => {
  const json = gen(docDir)
  const out = join(docDir, 'toc.yml')

  save(out, json)
}

export const overwriteTOC = (docDir) => {
  const json = gen(docDir)
  const out = join(docDir, 'toc.yml')

  del.sync([out])
  save(out, json)
}
