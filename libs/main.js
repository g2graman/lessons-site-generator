import { writeFileSync, existsSync, copySync } from 'fs-extra'
import { join, relative, dirname, normalize, sep } from 'path'
import glob from 'glob'
import copy from 'recursive-copy'
import del from 'del'
import mkdirp from 'mkdirp'
import deepAssign from 'deep-assign'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import routeTable from './routes'
import mdLoader from './md-loader'
import _document from './_document'
import App from '../pages/App'

let pkg = {
  name: 'FlyBook',
  description: 'FlyBook',
  homepage: '',
  author: {},
  repository: {
    type: 'git',
    url: ''
  }
}

try {
  pkg = deepAssign(pkg, require(join(process.cwd(), 'package.json').toString()))
} catch (e) {}

const Html = (
  title,
  contents,
  root,
  routes,
  theme,
  font,
  codeStyle
) => {
  return _document({
    title,
    root,
    theme,
    font,
    codeStyle,
    body: renderToStaticMarkup(createElement(App, { title, contents, toc: routes, pkg, root }))
  })
}

const makeIndexPage = (
  docDir,
  outDir,
  routes,
  theme,
  font,
  codeStyle
) => {
  let contents;
  let html;

  const loadIndex = (docDir) => {
    contents = mdLoader(join(docDir, 'readme.md'))
    return contents
  };

  if (!existsSync(join(docDir, 'readme.md'))) {
    if (!existsSync(join(process.cwd(), 'readme.md'))) {
      console.log(`> No 'readme.md' file found in ${docDir} and project root`)
      process.exit(1)
    } else {
      contents = loadIndex(process.cwd())
    }
  } else {
    contents = loadIndex(docDir)
  }

  html = Html(pkg.name, contents, '', routes, theme, font, codeStyle)

  /* gen new files */
  writeFileSync(join(outDir, 'index.html'), html, { encoding: 'utf8' })
}

export default ({ docDir, outDir, silent, prod, theme, font, codeStyle }) => {
  const routes = routeTable(docDir) || {};

  // if not production mode, homepage is '/' path
  if (!prod) {
    pkg.homepage = '/'
  }

  /* clean previous files */
  del.sync([join(outDir, '**', '*')])

  // create output directory
  mkdirp.sync(outDir)

  // make index page
  makeIndexPage(docDir, outDir, routes, theme, font, codeStyle)

  Object.keys(routes).forEach(key => {
    const subRoutes = routes[key] || {}

    for (let title in subRoutes) {
      let file = subRoutes[title]

      let outputDir = join(outDir, dirname(file))
      let outputFile = join(outDir, file.replace(/\.md$/, '.html'))
      let contents = mdLoader(join(docDir, file))
      let relativePath = relative(outputDir, outDir)
      relativePath = relativePath === '' ? '.' : relativePath

      let html = Html(title, contents, relativePath + sep, routes, theme, font, codeStyle)

      /* mkdir output dir */
      mkdirp.sync(outputDir)

      /* gen new files */
      writeFileSync(outputFile, html, { encoding: 'utf8' })

      // log
      if (!silent) {
        console.log('>', key, '-', title, '\n', outputFile)
      }
    }
  })

  /* copy static assets */
  copy(join(__dirname, '..', '..', 'static'), join(outDir, 'static')).then(result => {
    console.log(`> FlyBook was generated at ${outDir}`)
  })

  /* copy assets which is used in docs */
  const files = glob.sync(
    join(docDir, '**', '!(*.md|*.markdown|*.mdown|*.mkdn|*.mkd|*.mdwn|*.mkdown|toc.yml)'),
    {
      ignore: [join(docDir, 'node_modules', '**')],
      nodir: true
    }
  )
  files.map(file => normalize(file)).forEach(file => {
    copySync(file, file.replace(docDir, outDir))
  })
}
