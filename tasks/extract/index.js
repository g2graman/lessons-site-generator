'use strict';

const path = require('path');

const extraFs = require('fs-extra-promise');
const R = require('ramda');
const pick = require('lodash.pick');
const matter = require('gray-matter');

const CONFIG = require('./config');
const extractLib = require('./lib');

// TODO: modularize / clean this up
const extractJsCodeBlocks = (content, file) => {
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
    Promise.all(
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

        extraFs.truncateAsync(originalAbsoluteFilePath, 0).then(() => {
          return extraFs.writeFileAsync(originalAbsoluteFilePath, newMarkdownFileContent);
        }).then(() => {
          console.log('Done extracting code blocks for', originalAbsoluteFilePath);
        }, err => {
          console.error(err);
          process.exit(-1); // eslint-disable-line unicorn/no-process-exit
        });
      }
    });
  }
};

const extractJsCodeBlocksForFile = (stream, file) => {
  extractJsCodeBlocks(file.contents.toString('utf-8'), file);
  return stream; // Leave the stream unchanged, in case of a pipe following this
};

module.exports = function (gulp, $) {
  return function () {
    return gulp.src('./data/blog/**/*.md')
      .pipe($.foreach(extractJsCodeBlocksForFile));
  };
};
