'use strict';

const gulp = require('gulp');

const tasksLib = require('./tasks/lib');

const dependencies = {
  frame: ['extract'],
  extract: ['extract:clean']
}; // [extract:clean] --> [extract] --> frame

tasksLib.makeGulpTasksFromDependencies(dependencies);

gulp.task('default', ['frame']);
