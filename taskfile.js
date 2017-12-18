const notifier = require('node-notifier')

export async function compile (taskr) {
  await taskr.parallel(['bin', 'libs', 'components'])
}

export async function bin (taskr, opts) {
  await taskr
    .source(opts.src || 'bin/*')
    .babel()
    .target('dist/bin', { mode: '0755' })
  notify('Compiled binaries')
}

export async function components (taskr, opts) {
  await taskr
    .source(opts.src || 'components/*')
    .babel({ babelrc: true })
    .target('dist/components')
  notify('Compiled components')
}

export async function libs (taskr, opts) {
  await taskr.source(opts.src || 'libs/**/*.js').babel().target('dist/libs')
  notify('Compiled lib files')
}

export async function copy (taskr) {
  await taskr
    .source('pages/**/*.js')
    .babel({ babelrc: true })
    .target('dist/pages')
  notify('Compiled page files and Copied package.json')
}

export async function build (taskr) {
  await taskr.serial(['copy', 'compile'])
}

export default async function (taskr) {
  await taskr.start('build')
  await taskr.watch('bin/*', 'bin')
  await taskr.watch('components/*', 'components')
  await taskr.watch('libs/**/*.js', ['libs'])
  await taskr.watch('pages/**/*.js', 'copy')
}

export async function release (taskr) {
  await taskr.clear('dist').start('build')
}

// notification helper
function notify (msg) {
  return notifier.notify({
    title: 'Next-Book',
    message: msg,
    icon: false
  })
}
