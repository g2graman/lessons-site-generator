'use strict';

const path = require('path');

const extraFs = require('fs-extra-promise');
const R = require('ramda');
const matter = require('gray-matter');

const cleasnMarkdownMetadata = (content, file) => {
  const parsedMarkdown = matter(content);

  const metadataInMarkdown = R.path(['data', 'custom', 'metadata'], parsedMarkdown);
  if (path.extname(file.path) === '.md' && (
      !metadataInMarkdown ||
      !Array.isArray(metadataInMarkdown)
    )
  ) {
    const newMarkdown = {
      ...parsedMarkdown,
      data: R.omit(['custom'], (parsedMarkdown.data || {}))
    };

    const newMarkdownFileContent = matter.stringify(newMarkdown.content, newMarkdown.data, {});

    const originalAbsoluteFilePath = path.resolve(file.path);

    extraFs.truncateAsync(originalAbsoluteFilePath, 0).then(() => {
      return extraFs.writeFileAsync(originalAbsoluteFilePath, newMarkdownFileContent);
    }).then(() => {
      console.log('Done extracting code blocks for', originalAbsoluteFilePath);
    }, err => {
      console.error(err);
      process.exit(-1); // eslint-disable-line unicorn/no-process-exit
    });
  }
};

const cleasnMarkdownMetadataForFile = (stream, file) => {
  cleasnMarkdownMetadata(file.contents.toString('utf-8'), file);
  return stream; // Leave the stream unchanged, in case of a pipe following this
};

module.exports = function (gulp, $) {
  return function () {
    return gulp.src('./data/blog/**/*.md')
      .pipe($.foreach(cleasnMarkdownMetadataForFile));
  };
};
