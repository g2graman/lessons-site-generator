'use strict';

const path = require('path');

const extraFs = require('fs-extra-promise');
const R = require('ramda');
const pick = require('lodash.pick');
const matter = require('gray-matter');
const through = require('through2');
const Vinyl = require('vinyl');

const getOptions = require('../options');
const CONFIG = require('./config');
const extractLib = require('./lib');

// TODO: modularize / clean this up
const extractJsCodeBlocks = (content, file, options) => {
  const matches = (
    extractLib.getMatchingMarkdownBlocks( // Get all code blocks
      content,
      CONFIG.START_CODE_MARKDOWN_TOKEN,
      CONFIG.END_CODE_MARKDOWN_TOKEN
    )
  ) || [];

  const {blocks} = matches;
  const parsedMarkdown = matter(content);

  const metadataInMarkdown = R.path(['data', 'custom', 'metadata'], parsedMarkdown);

  if (path.extname(file.path) === '.md' && (
      !metadataInMarkdown ||
      !Array.isArray(metadataInMarkdown)
    )
  ) {
    return Promise.all(
      blocks.map(extractLib.createRepl)
    ).then(newRepls => {
      const replUrls = newRepls
        .filter(Boolean)
        .map(newRepl => `${CONFIG.REPL_IT_ROOT}${newRepl.url}`);

      if (replUrls.length > 0) {
        const normalizedMetadata = extractLib.zipAllAs([
          matches.locations,
          matches.lengths,
          matches.blocks,
          newRepls,
          replUrls
        ], [
          'location',
          'length',
          'block',
          'repl',
          'url'
        ]);

        const newMarkdown = Object.assign({}, parsedMarkdown);
        newMarkdown.data = Object.assign({}, (newMarkdown.data || {}), {
          custom: {
            metadata: normalizedMetadata.map(meta => {
              return {
                ...pick(meta, [
                  'location',
                  'length',
                  'block',
                  'repl.slug',
                  'repl.url',
                  'url'
                ]),
                block: Buffer.from(meta.block).toString('base64')
              };
            })
          }
        });

        let newMarkdownFileContent = matter.stringify(newMarkdown.content, newMarkdown.data, {});
        newMarkdownFileContent = newMarkdownFileContent.replace(/\s+$/, '');

        const originalAbsoluteFilePath = path.resolve(file.path);

        let nextPromise = null;
        if (options.d) {
          nextPromise = Promise.resolve(''); // Skip writing to the markdown file
        }

        nextPromise = nextPromise || (
          extraFs.truncateAsync(originalAbsoluteFilePath, 0).then(() => {
            return extraFs.writeFileAsync(originalAbsoluteFilePath, newMarkdownFileContent);
          })
        );

        return nextPromise.then(() => {
          // Console.log('Done extracting code blocks for', originalAbsoluteFilePath);
          // process.stdout.write(newMarkdownFileContent);
          return newMarkdownFileContent;
        }, err => {
          console.error(err);
          process.exit(-1); // eslint-disable-line unicorn/no-process-exit
        });
      }
    })
    .catch(err => {
      console.error(err);
      process.exit(-1); // eslint-disable-line unicorn/no-process-exit
    });
  }
};

const extractJsCodeBlocksForFile = (file, options) => {
  return extractJsCodeBlocks(file.contents.toString('utf-8'), file, options);
};

module.exports = function (gulp, $) {
  return function () {
    const options = getOptions($);

    return gulp.src(['./data/blog/**/*.md'])
      .pipe(through.obj((file, enc, cb) => {
        return extractJsCodeBlocksForFile(file, options)
          .then(newContent => {
            if (typeof newContent === 'undefined') {
              return cb(null, null);
            }

            return cb(
              null,
              new Vinyl({
                ...R.pick(['cwd', 'base', 'path'], file),
                contents: Buffer.from(newContent)
              })
            );
          }).catch(console.error);
      }));
  };
};
