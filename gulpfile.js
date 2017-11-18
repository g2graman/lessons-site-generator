'use strict';

const path = require('path');

const gulp = require('gulp');
const extraFs = require('fs-extra-promise');
const _ = require('lodash');
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

    const truncatedNewBlock = newBlock.slice(START_TOKEN.length).slice(0, -END_TOKEN.length);
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

    if (path.extname(file.path) === '.md' && (
        !_.get(parsedMarkdown, 'data.custom.slugs') ||
        !Array.isArray(_.get(parsedMarkdown, 'data.custom.slugs'))
      )
    ) {
      Promise.all(
        blocks.map(createRepl)
      ).then(newRepls => {
        const normalizedMetadata = _.zip(matches.locations,
          matches.lengths,
          matches.blocks,
          newRepls
        ).map(fixture => _.zipObject([
          'location',
          'length',
          'block',
          'repl'
        ], fixture)
        );

        const replUrls = newRepls
          .filter(Boolean)
          .map(newRepl => `${REPL_IT_ROOT}${newRepl.url}`);

        if (replUrls.length > 0) {
          const newMarkdown = Object.assign({}, parsedMarkdown);
          newMarkdown.data = Object.assign({}, (newMarkdown.data || {}), {
            custom: {
              metadata: normalizedMetadata.map(meta => {
                return {
                  ..._.pick(meta, [
                    'location',
                    'length',
                    'block',
                    'repl.slug',
                    'repl.url'
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
