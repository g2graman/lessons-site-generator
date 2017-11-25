'use strict';

const gulp = require('gulp');
const R = require('ramda');
const requireDir = require('require-dir');
const gulpLoadPlugins = require('gulp-load-plugins');
const packages = require('../package.json');

const $ = gulpLoadPlugins({config: packages});

const taskFactories = requireDir('../tasks', {recurse: true});

const get = (pathWithDots, obj) => {
  return R.path(pathWithDots.split('.'), obj);
};

const transformTaskName = (taskName, pathMode = true) => {
  return taskName.indexOf(':') === -1 ?
    `${taskName}${pathMode ? '.index' : ''}` :
    pathMode ? taskName.split(':').join('.') : taskName;
};

const transformTaskNameToPath = taskName => transformTaskName(taskName, true);
const transformTaskDependencyName = taskName => transformTaskName(taskName, false);

const makeGulpTasksFromDependencies = dependencies => {
  const taskDependencyFactories = R.reduce((accumulator, taskFactoryName) => {
    // TODO: BETTER VALIDATION ? ASSERTIONS? RE: !(taskFactoryName in dependencies)
    const taskDependencies = get(taskFactoryName, dependencies) ||
      get(taskFactoryName, taskFactories);

    return {
      ...accumulator,
      [taskFactoryName]: get(transformTaskNameToPath(taskFactoryName), taskFactories),
      ...taskDependencies.reduce((result, taskDependency) => {
        const transformedTaskFactoryName = transformTaskNameToPath(taskDependency);
        const transformedDependencyName = transformTaskDependencyName(taskDependency);

        return {
          ...result,
          [transformedDependencyName]: get(transformedTaskFactoryName, taskFactories)
        };
      }, {})
    };
  }, {}, R.keys(dependencies));

  R.forEach(taskFactoryName => {
    const taskFactory = get(taskFactoryName, taskDependencyFactories);
    const taskDependencies = get(taskFactoryName, dependencies);

    return (taskFactoryName in dependencies) ?
      gulp.task(taskFactoryName, taskDependencies, taskFactory(gulp, $)) : // Tasks with dependencies
      gulp.task(taskFactoryName, taskFactory(gulp, $)); // Tasks without dependencies
  }, R.keys(taskDependencyFactories));
};

module.exports = {
  makeGulpTasksFromDependencies
};
