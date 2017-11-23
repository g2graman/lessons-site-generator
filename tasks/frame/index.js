'use strict';

const matter = require('gray-matter');

module.exports = function (gulp, $) {
  return function () {
    return gulp.src('./data/blog/**/*.md')
      .pipe($.foreach((stream, file) => {
        const parsedMarkdown = matter(file.contents.toString('utf-8'));
        console.log('FRAME:', parsedMarkdown);

        return stream;
      }));
  };
};
