'use strict';

const path = require('path');

const R = require('ramda');
const pick = require('lodash.pick');
const matter = require('gray-matter');
const through = require('through2');
const Vinyl = require('vinyl');

const getOptions = require('../options');
const CONFIG = require('./config');
const extractLib = require('./lib');

const transformParsedMarkdownWithMetadata = (parsedMarkdown, normalizedMetadata) => {
  return {
    ...parsedMarkdown,
    data: {
      ...parsedMarkdown.data,
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
    }
  };
};

const zipMetadata = (metadataMatchingBlock, newRepls, replUrls) => {
  return extractLib.zipAllAs([
    metadataMatchingBlock.locations,
    metadataMatchingBlock.lengths,
    metadataMatchingBlock.blocks,
    newRepls,
    replUrls
  ], [
    'location',
    'length',
    'block',
    'repl',
    'url'
  ]);
};

const getReplUrlsFromSlugs = replSlugs => {
  return replSlugs
    .filter(Boolean)
    .map(replSlug => `${CONFIG.REPL_IT_ROOT}${replSlug.url}`);
};

const getMetadataInParsedMarkdown = parsedMarkdown => {
  return R.path(['data', 'custom', 'metadata'], parsedMarkdown);
};

const isMarkdownWithoutMetadata = (filePath, parsedMarkdown) => {
  const metadataInMarkdown = getMetadataInParsedMarkdown(parsedMarkdown);

  return (
    path.extname(filePath) === '.md' && (
      !metadataInMarkdown ||
      !Array.isArray(metadataInMarkdown))
  );
};

const extractJsCodeBlocks = (content, file, options) => {
  const matches = (
    extractLib.getMatchingMarkdownBlocks( // Get all matching code blocks in the markdown
      content,
      CONFIG.START_CODE_MARKDOWN_TOKEN,
      CONFIG.END_CODE_MARKDOWN_TOKEN
    )
  ) || [];

  const {blocks} = matches;
  const parsedMarkdown = matter(content);

  if (isMarkdownWithoutMetadata(file.path, parsedMarkdown)) {
    return Promise.all(
      blocks.map(extractLib.createRepl)
    ).then(newReplSlugs => {
      const replUrls = getReplUrlsFromSlugs(newReplSlugs);

      if (replUrls.length > 0) {
        const normalizedMetadata = zipMetadata(matches, newReplSlugs, replUrls);
        const newMarkdown = transformParsedMarkdownWithMetadata(parsedMarkdown, normalizedMetadata);

        const newMarkdownFileContent = matter
          .stringify(newMarkdown.content, newMarkdown.data, {})
          .replace(/\s+$/, '');

        const originalAbsoluteFilePath = path.resolve(file.path);
        return extractLib.handleDryRunMode(originalAbsoluteFilePath, newMarkdownFileContent, options);
      }

      return undefined; // No repls, skip file
    }).catch(err => {
      console.error(err);
      process.exit(-1); // eslint-disable-line unicorn/no-process-exit
    });
  }

  return Promise.resolve(undefined); // Is not markdown or already has metadata, skip file
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
              return cb(null, null); // Omit file from pipe
            }

            return cb(
              null,
              new Vinyl({
                ...R.pick(['cwd', 'base', 'path'], file),
                contents: Buffer.from(newContent) // Pipe file with new content
              })
            );
          }).catch(console.error);
      }));
  };
};
