'use strict';

const matter = require('gray-matter');
const R = require('ramda');
const entities = require('entities');

const CONFIG = require('../extract/config');

const IFRAME_WIDTH = 600;
const IFRAME_HEIGHT = 400;

const makeIFrame = (url, width = IFRAME_WIDTH, height = IFRAME_HEIGHT) => {
  return entities.encodeHTML(`<iframe url="${url} width="${width}" height="${height}"></iframe>`);
};

// WIP
const metadataReducer = (file, originalContent, markdownMetadata, parsedMarkdown) => {
  return markdownMetadata.reduce((result, metaBlock, currentIndex) => {
    let [beforeSplit, afterSplit] = R.splitAt(currentIndex + 1, result.markdown);
    beforeSplit = beforeSplit.slice(0, -1);

    const startChunkIndex = metaBlock.location - 1 +
      CONFIG.START_CODE_MARKDOWN_TOKEN.length +
      result.runningOffset;

    const endChunkIndex = metaBlock.location +
      metaBlock.length +
      CONFIG.START_CODE_MARKDOWN_TOKEN.length - 1 +
      result.runningOffset;

    const chunk = result.content.slice(startChunkIndex, endChunkIndex);
    console.log('END', result.content.slice(0, endChunkIndex), 'END END');
    console.log('START', result.content.slice(0, startChunkIndex), 'START END');

    const newIFrame = makeIFrame(metaBlock.url);
    const deltaRunningOffset = newIFrame.length +
      CONFIG.START_CODE_MARKDOWN_TOKEN.length +
      CONFIG.END_CODE_MARKDOWN_TOKEN.length -
      metaBlock.length +
      result.runningOffset;

    const newContent = result.content.slice(0, startChunkIndex - CONFIG.START_CODE_MARKDOWN_TOKEN.length) +
      newIFrame +
      result.content.slice(endChunkIndex + CONFIG.END_CODE_MARKDOWN_TOKEN.length);

    console.log('CHUNK', chunk);
    console.log('IFrame', newIFrame);
    console.log('delta', deltaRunningOffset);
    console.log('rOff', result.runningOffset);
    console.log('content', newContent);

    return {
      runningOffset: deltaRunningOffset,
      markdown: [
        ...beforeSplit, {
          ...metaBlock,
          location: metaBlock.location + result.runningOffset
        }, ...afterSplit
      ],
      content: newContent
    };
  }, {
    runningOffset: 0,
    markdown: [...markdownMetadata],
    content: parsedMarkdown.content
  });
};

module.exports = function (gulp, $) {
  return function () {
    return gulp.src('./data/blog/**/*.md')
      .pipe($.foreach((stream, file) => {
        const originalContent = file.contents.toString('utf-8');
        const parsedMarkdown = matter(originalContent);

        const markdownMetadata = R.path(['data', 'custom', 'metadata'], parsedMarkdown);

        if (markdownMetadata) {
          const results = metadataReducer(file, originalContent, markdownMetadata, parsedMarkdown);
          console.log(matter.stringify(results.content, parsedMarkdown.data, {}));
        }

        return stream;
      }));
  };
};
