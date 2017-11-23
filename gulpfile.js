'use strict';

const gulp = require('gulp');
const R = require('ramda');
const requireDir = require('require-dir');
const gulpLoadPlugins = require('gulp-load-plugins');
const packages = require('./package.json');

const $ = gulpLoadPlugins({config: packages});

const taskFactories = requireDir('./tasks', {recurse: true});

const dependencies = {
  frame: ['extract']
};

R.forEach(taskFactoryName => {
  const mainTaskFactory = (taskFactories[taskFactoryName].index); // Use the index file as the source for the task

  return (taskFactoryName in dependencies) ?
    gulp.task(taskFactoryName, dependencies[taskFactoryName], mainTaskFactory(gulp, $)) :
    gulp.task(taskFactoryName, mainTaskFactory(gulp, $));
}, R.keys(taskFactories));

gulp.task('default', ['frame']);
