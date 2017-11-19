'use strict';

const path = require('path');

const gulp = require('gulp');
const extraFs = require('fs-extra-promise');
const R = require('ramda');
const zip = require('lodash.zip');
const pick = require('lodash.pick');
const matter = require('gray-matter');
const request = require('request-promise');
const gulpLoadPlugins = require('gulp-load-plugins');

const packages = require('./package.json');

const $ = gulpLoadPlugins({config: packages});

// START TOKENS
const START_CODE_MARKDOWN_TOKEN = '```javascript';
const END_CODE_MARKDOWN_TOKEN = '```';
// END TOKENS

const REPL_IT_ROOT = 'https://repl.it';

const zipAllAs = (lists, keys) => zip(...lists).map(R.zipObj(keys));

/* Const renameKeys = R.curry((keysMap, obj) =>
  R.reduce((acc, key) => R.assoc(keysMap[key] || key, obj[key], acc), {}, R.keys(obj))
); */

const getNthOccurrenceIndex = (string, subString, index) => {
  return string.split(subString, index).join(subString).length;
};

const getMatchingMarkdownBlocks = (markdownContent, START_TOKEN, END_TOKEN) => {
  let index = 0;
  const blocks = [];
  let metadata = {};

  let startIndex = markdownContent.slice(index).indexOf(START_TOKEN);

  while (index !== undefined && startIndex !== -1) {
    const fromStartToken = markdownContent.slice(index).slice(startIndex);

    const nthOccurrenceIndex = getNthOccurrenceIndex(fromStartToken, END_TOKEN, 2);
    const endIndexFromStart = nthOccurrenceIndex === -1 ?
      nthOccurrenceIndex :
      nthOccurrenceIndex + END_TOKEN.length;

    const newBlock = endIndexFromStart === -1 ?
      fromStartToken :
      fromStartToken.slice(0, endIndexFromStart);

    const truncatedNewBlock = newBlock
      .slice(START_TOKEN.length) // Start the block at the end of the START_TOKEN
      .slice(0, -END_TOKEN.length); // End the block at the start of the END_TOKEN

    if (truncatedNewBlock.trim().length > 0) {
      blocks.push(truncatedNewBlock);

      metadata = {
        ...metadata,
        locations: (metadata.locations || []).concat([index + startIndex]),
        lengths: (metadata.lengths || []).concat([
          newBlock.length - (
            START_TOKEN.length + END_TOKEN.length
          )
        ])
      };
    }

    index = index + startIndex + endIndexFromStart;
    startIndex = markdownContent.slice(index).indexOf(START_TOKEN);
  }

  return {
    ...metadata,
    locations: metadata.locations || [],
    lengths: metadata.lengths || [],
    blocks
  };
};

// TODO: create REPL under certain user
const createRepl = jsReplContent => {
  if (typeof jsReplContent !== 'string' || jsReplContent.length === 0) {
    return Promise.resolve(false);
  }

  return request({
    method: 'POST',
    uri: `${REPL_IT_ROOT}/data/repls/new`,
    form: {
      language: 'javascript',
      editor_text: jsReplContent, // eslint-disable-line camelcase
      is_project: false // eslint-disable-line camelcase
    }, json: true
  });
};

const extractJsCodeBlocks = (stream, file) => {
  ((content, file) => {
    const matches = (
      getMatchingMarkdownBlocks( // Get all code blocks
        content,
        START_CODE_MARKDOWN_TOKEN,
        END_CODE_MARKDOWN_TOKEN
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
        blocks.map(createRepl)
      ).then(newRepls => {
        const replUrls = newRepls
          .filter(Boolean)
          .map(newRepl => `${REPL_IT_ROOT}${newRepl.url}`);

        if (replUrls.length > 0) {
          const normalizedMetadata = zipAllAs([
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

          const newMarkdownFileContent = matter.stringify(newMarkdown.content, newMarkdown.data);
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
  })(file.contents.toString('utf-8'), file);

  return stream; // Leave the stream unchanged
};

gulp.task('default', () => {
  return gulp.src('./data/blog/**/*.md')
    .pipe($.foreach(extractJsCodeBlocks));
});
