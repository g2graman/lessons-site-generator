'use strict';

/*
    NOTE: This file is not an actual webpack config file. It is meant to customize the webpack build that
    executes as part of the gatsby build. You can read more about how that's done here:
    https://github.com/gatsbyjs/gatsby/blob/master/docs/docs/add-custom-webpack-config.md
*/
const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = {
  modifyWebpackConfig: ({config, stage}) => {
    switch (stage) {
      case 'develop':
        config.plugin(
                    CircularDependencyPlugin.name,
                    () => new CircularDependencyPlugin({
                      exclude: /node_modules/,
                      failOnError: true
                    })
                );

        break;
    }

    return config;
  }
};
