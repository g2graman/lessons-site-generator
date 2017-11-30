'use strict';

const gulp = require('gulp');
const program = require('commander');

const tasksLib = require('./tasks/lib');

const pkg = require('./package.json');

const parseArgs = (pkg, argv, program) => {
  return program
    .version(pkg.version)
    // .usage('[options] <file ...>')
    .option('-d, --dry-run', 'Dry run')
    .option('-c, --smart-clean', 'Enable smart clean')
    .parse(argv);
};

parseArgs(pkg, process.argv, program);

const dependencies = {
  frame: program.d ?
    [] :
    ['extract'],
  extract: ['extract:clean']
}; // [extract:clean] --> [extract] --> frame

tasksLib.makeGulpTasksFromDependencies(dependencies);

gulp.task('default', ['frame']);
