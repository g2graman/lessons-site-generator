'use strict';

const path = require('path');

// Const extraFs = require('fs-extra-promise');
const through = require('through2');
const transform = require('vinyl-transform');
const R = require('ramda');
const matter = require('gray-matter');

const enableExtraFeatures = /e?x(tras)?/i.test(process.env.NODE_ENV);

const cleanMarkdownMetadata = (content, file) => {
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
    console.log(newMarkdownFileContent);

    // TODO: modify below
    /* process.exit(0);

    const originalAbsoluteFilePath = path.resolve(file.path);

    extraFs.truncateAsync(originalAbsoluteFilePath, 0).then(() => {
      return extraFs.writeFileAsync(originalAbsoluteFilePath, newMarkdownFileContent);
    }).then(() => {
      console.log('Done extracting code blocks for', originalAbsoluteFilePath);
    }, err => {
      console.error(err);
      process.exit(-1); // eslint-disable-line unicorn/no-process-exit
    }); */
  }
};

const getModifiedFiles = $ => transform(filename => {
  return through(function (file, encoding, done) {
    return $.git.status({args: '-s', quiet: true}, (err, stdout) => {
      if (err) {
        throw err;
      }

      const modifiedFiles = stdout.split('\n')
        .filter(Boolean)
        .map(s => s.trim())
        .filter(line => line.startsWith('M'))
        .map(line => line.slice(2))
        .map(filePath => path.resolve('./', filePath));

      if (modifiedFiles.indexOf(filename) > -1) {
        this.push(file);
      }

      return done();
    });
  });
});

const ignoreEmptyFiles = $ => {
  return $.ignore.include(file => {
    return Boolean(file.contents.toString().length);
  });
};

const cleanMarkdownMetadataForFile = (stream, file) => {
  cleanMarkdownMetadata(file.contents.toString('utf-8'), file);
  return stream; // Leave the stream unchanged, in case of a pipe following this
};

module.exports = function (gulp, $) {
  return function () {
    return gulp.src('./data/blog/**/*.md')
      .pipe($.if(enableExtraFeatures, getModifiedFiles($)))
      .pipe($.if(enableExtraFeatures, ignoreEmptyFiles($)))
      .pipe($.debug())
      .pipe($.foreach(cleanMarkdownMetadataForFile));
  };
};
