import React from 'react'
import {kebabCase, startCase} from 'lodash'
import {readdir, readFile} from 'mz/fs'
import glob from 'glob-promise'
import matter from 'gray-matter'
import path from 'path'
import ExtractTextPlugin from 'extract-text-webpack-plugin';

import CDNConfig from './config/cdn.json'
import marked from './config/marked';

const NPM_SCRIPT_USED = process.env.npm_lifecycle_event;

const parseMarkdownFiles = async () => {
    let markdownFiles = await glob(
      path.resolve('.', 'bridge', 'resources', '**', '*.md')
    );

    let allMarkdownContent = await Promise.all(
        markdownFiles.map((filePath) => {
            return readFile(
                path.resolve('.', 'docs', filePath),
                'utf8'
            ).then(markdownContent => {
                return {
                    contents: markdownContent,
                    title: startCase(path.basename(filePath.split('.md').join('')))
                }
            });
        })
    );

    return (allMarkdownContent)
        .map((markdownFile) => {
            return {
                title: markdownFile.title,
                contents: matter(markdownFile.contents)
            };
        });
};

const getModules = async () => {
    return (await parseMarkdownFiles())
        .map((parsedMarkdown) => {
            return {
                id: kebabCase(parsedMarkdown.title),
                title: parsedMarkdown.title,
                ...parsedMarkdown.contents.data,
                body: marked(parsedMarkdown.contents.content)
            };
        });
};

const STATIC_ROUTES = [{
    path: '/about',
    component: 'src/pages/About',
}];

const getProps = (props, key) => () => ({
    [key]: props
});

const getDocument = ({Html, Head, Body, children, renderMeta}) => (
    <Html lang="en-US">
        <Head>
            <meta charSet="UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0"/>
            {
              CDNConfig.styles.map((CDNStyleURL, index) => <link key={index+ '-style'} rel="stylesheet" href={CDNStyleURL}/>)
            }
        </Head>
        <Body>
            <div className="slug-home">
              {children}
              {
                renderMeta.scripts &&
                renderMeta.scripts.map(script => <script type="text/javascript" src={`/${script}`}/>)
              }
            </div>
        </Body>
    </Html>
);

const handleWebpackBuild = (config, {defaultLoaders, stage}) => {
    config.module.rules = [
      {
        oneOf: [
          {
            test: /\.svg$/,
            exclude: /node_modules/,
            use: [
              "babel-loader",
              {
                loader: 'react-svg-loader', // 'react-svg'
                query: {
                  svgo: {
                    pretty: true,
                    plugins: [{ removeStyleElement: true }]
                  }
                }
              }
            ]
          },
          defaultLoaders.cssLoader,
          defaultLoaders.jsLoader,
          defaultLoaders.fileLoader,
        ],
      },
    ];

    return config
};

export default {
    siteRoot: NPM_SCRIPT_USED === 'pages'
        ? 'https://g2graman.github.io/lessons-site-generator'
        : null,
    getSiteProps: () => ({
        title: 'React Static',
    }),
    getRoutes: async () => {
        let modules = await getModules();

        return [
            ...STATIC_ROUTES, {
                path: '/',
                component: 'src/pages/Modules',
                getProps: getProps(modules, 'modules'),
                children: modules.map(bridgeModule => ({
                    path: `modules/${bridgeModule.id}`,
                    component: 'src/pages/Module',
                    getProps: getProps(bridgeModule, 'module'),
                })),
            }, {
                is404: true,
                component: 'src/pages/404',
            },
        ]
    },
    Document: getDocument,
    webpack: handleWebpackBuild
}
