'use strict';

const matter = require('gray-matter');
const R = require('ramda');
// Const entities = require('entities');
const through = require('through2');
const Vinyl = require('vinyl');
const Mustache = require('mustache');

const CONFIG = require('../extract/config');
const getOptions = require('../options');
const extractTask = require('../extract');
const extractLib = require('../extract/lib');

const IFRAME_HEIGHT = 650;

const makeIFrame = (url, height = IFRAME_HEIGHT) => {
  return `<iframe height="${height}"
    width="100%"
    src="${url}?lite=true"
    scrolling="no"
    frameborder="no"
    allowtransparency="true"
    allowfullscreen="true"
    sandbox="allow-forms
    allow-pointer-lock
    allow-popups
    allow-same-origin
    allow-scripts
    allow-modals"></iframe>`;
};

const metadataReducer = (file, originalContent, markdownMetadata) => {
  const markdownContentStart = extractLib.getNthOccurrenceIndex(
    originalContent,
    CONFIG.MARKDOWN_METADATA_DELIMITER,
    2
  ) + CONFIG.MARKDOWN_METADATA_DELIMITER.length;

  const contentAfterMetadata = originalContent.slice(markdownContentStart);

  const mustacheParseChunks = Mustache.parse(contentAfterMetadata, [
    CONFIG.START_CODE_MARKDOWN_TOKEN,
    CONFIG.END_CODE_MARKDOWN_TOKEN
  ]);

  return mustacheParseChunks.reduce(
    ({matchCount, content}, [chunkType, chunkContent]) => {
      if (chunkType === 'text') {
        return {
          matchCount,
          content: `${content}${chunkContent}`
        };
      }

      if (chunkType === 'name') {
        const currentMetadataBlock = markdownMetadata[matchCount];
        const currentIFrame = makeIFrame(currentMetadataBlock.url);

        return {
          matchCount: matchCount + 1,
          content: `${content}${currentIFrame}`
        };
      }

      // Otherwise, discard this chunk. We really shouldn't reach here though
      return {
        matchCount,
        content
      };
    }, {
      matchCount: 0,
      content: ''
    });
};

const frameJsCodeBlocksForFile = (file, options) => {
  const originalContent = file.contents.toString('utf-8');
  const parsedMarkdown = matter(originalContent);

  const markdownMetadata = R.path(['data', 'custom', 'metadata'], parsedMarkdown);

  if (markdownMetadata) {
    const {content: newContent} = metadataReducer(file, originalContent, markdownMetadata);
    console.log(newContent);

    const newMarkdownContent = matter.stringify(newContent, parsedMarkdown.data, {});

    // Console.log(newMarkdownContent);

    return extractLib.handleDryRunMode(file.path, newMarkdownContent, options);
  }

  return Promise.resolve(undefined);
};

module.exports = function (gulp, $) {
  const options = getOptions($);

  return function () {
    const source = options.d ?
      extractTask(gulp, $)() :
      gulp.src('./data/blog/**/*.md');

    return source
      .pipe(through.obj((file, enc, cb) => {
        return frameJsCodeBlocksForFile(file, options).then(newContent => {
          if (typeof newContent === 'undefined') {
            return cb(null, null);
          }

          return cb(
            null,
            new Vinyl({
              ...R.pick(['cwd', 'base', 'path'], file), // Copy all properties of original file, except contents
              contents: Buffer.from(newContent)
            })
          );
        });
      }));
  };
};
