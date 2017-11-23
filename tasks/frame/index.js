'use strict';

const matter = require('gray-matter');
const R = require('ramda');

const CONFIG = require('../extract/config');

const metadataReducer = (file, markdownMetadata, parsedMarkdown) => {
  return markdownMetadata.reduce((result, metaBlock, currentIndex) => {
    let [beforeSplit, afterSplit] = R.splitAt(currentIndex + 1, result);
    beforeSplit = beforeSplit.slice(0, -1);

    console.log('before', beforeSplit);
    console.log('after', afterSplit);
    console.log('current', metaBlock);

    console.log(
      metaBlock.location,
      metaBlock.location + metaBlock.length
    );

    console.log('CHUNK', parsedMarkdown.content.slice(
        metaBlock.location - (
            ((currentIndex + 1) * CONFIG.START_CODE_MARKDOWN_TOKEN.length) +
            (currentIndex * CONFIG.END_CODE_MARKDOWN_TOKEN.length)
        ), metaBlock.location + metaBlock.length
      )
    );

    return [
      ...beforeSplit,
      metaBlock,
      ...afterSplit
    ];
  }, [...markdownMetadata]);
};

module.exports = function (gulp, $) {
  return function () {
    return gulp.src('./data/blog/**/*.md')
      .pipe($.foreach((stream, file) => {
        const parsedMarkdown = matter(file.contents.toString('utf-8'));

        const markdownMetadata = R.path(['data', 'custom', 'metadata'], parsedMarkdown);
        if (markdownMetadata) {
          console.log(metadataReducer(file, markdownMetadata, parsedMarkdown));
        }

        return stream;
      }));
  };
};
