'use strict';

const packages = require('./package.json');

const gulp = require('gulp');
const path = require('path');
const extraFs = require('fs-extra-promise');
const _ = require('lodash');
const matter = require('gray-matter');
const request = require('request-promise');
const gulpLoadPlugins = require('gulp-load-plugins');
const $ = gulpLoadPlugins({config: packages});

const cheerio = require('cheerio');
const HtmlEntities = require('entities');
const Remarkable = require('remarkable');
const md = new Remarkable();

// START TOKENS
const START_CODE_HTML_TOKEN = '<code class="language-javascript">';
const END_CODE_HTML_TOKEN = '</code>';
// END TOKENS

const REPL_IT_ROOT = 'https://repl.it';

const getMatchingBlocks = (content, START_TOKEN, END_TOKEN) => {
    let index = 0;
    let blocks = [];

    let startIndex = content.slice(index).indexOf(START_TOKEN);

    while (index !== undefined && startIndex !== -1) {
        let fromStartToken = content.slice(index).slice(startIndex);

        let endIndexFromStart = fromStartToken.indexOf(END_TOKEN);
        endIndexFromStart = endIndexFromStart === -1
            ? undefined
            : endIndexFromStart + END_TOKEN.length;

        let newBlock = endIndexFromStart === undefined
            ? fromStartToken
            : fromStartToken.slice(0, endIndexFromStart);

        blocks.push(HtmlEntities.decodeHTML(cheerio(newBlock).html())); // decode special HTML encodings

        index = index + startIndex + endIndexFromStart;
        startIndex = content.slice(index).indexOf(START_TOKEN);
    }

    return blocks;
};

// TODO: use OAUTH TOKEN TO CREATE GIST AS CERTAIN USER
const createGist = (jsGistContent) => {
    if (typeof jsGistContent !== 'string' || jsGistContent.length === 0) {
        return Promise.resolve(false);
    }

    return request({
        method: 'POST',
        uri: 'https://api.github.com/gists',
        headers: {
            'User-Agent': 'anonymous' // required, should be github username
        },
        body: {
            // "description": "the description for this gist",
            "public": true,
            "files": {
                "index.js": {
                    "content": jsGistContent
                }
            }
        }, json: true
    }).then((newGist) => {
        console.log('SUCCESSFULLY CREATED GIST AT:', newGist.html_url);
    }, console.error.bind(this, 'ERROR:'));
};

// TODO: create REPL under certain user
const createRepl = (jsReplContent) => {
    if (typeof jsReplContent !== 'string' || jsReplContent.length === 0) {
        return Promise.resolve(false);
    }

    return request({
        method: 'POST',
        uri: `${REPL_IT_ROOT}/data/repls/new`,
        form: {
            "language": "javascript",
            "editor_text": jsReplContent,
            "is_project": false
        }, json: true
    })/*.then((newRepl) => {
        console.log('SUCCESSFULLY CREATED REPL AT:', `${REPL_IT_ROOT}${newRepl.url}`);
        return newRepl;
    });*/
};

const extractJsCodeBlocks = (stream, file) => {
    ((content, file) => {

        let blocks = getMatchingBlocks( // get all code blocks
            md.render(content),
            START_CODE_HTML_TOKEN,
            END_CODE_HTML_TOKEN
        ) || [];

        let parsedMarkdown = matter(content);

        if (path.extname(file.path) === '.md' && (
                !_.get(parsedMarkdown, 'data.custom.slugs') ||
                    !_.get(parsedMarkdown, 'data.custom.slugs').length
            )
        ) {
            Promise.all(
                blocks.map(createRepl)
            ).then((newRepls) => {
                let replUrls = newRepls
                    .filter(Boolean)
                    .map(newRepl => `${REPL_IT_ROOT}${newRepl.url}`);

                if (replUrls.length > 0) {
                    let newMarkdown = Object.assign({}, parsedMarkdown);
                    newMarkdown.data = Object.assign({}, (newMarkdown.data || {}), {
                        custom: {
                            repls: replUrls
                        }
                    });

                    let newMarkdownFileContent = matter.stringify(newMarkdown.content, newMarkdown.data);
                    let originalAbsoluteFilePath = path.resolve(file.path);

                    extraFs.truncateAsync(originalAbsoluteFilePath, 0).then(() => {
                        return extraFs.writeFileAsync(originalAbsoluteFilePath, newMarkdownFileContent);
                    }).then(() => {
                        console.log('Done extracting code blocks for', originalAbsoluteFilePath);
                    }, (err) => {
                        console.error(err);
                        process.exit(-1);
                    });
                }
            });
        }
    })(file.contents.toString('utf-8'), file);

    return stream; // leave the stream unchanged
};

gulp.task('default', () => {
    return gulp.src('./data/blog/**/*.md')
        .pipe($.foreach(extractJsCodeBlocks));
});