import React from 'react'
import fs from 'fs'
import {kebabCase, startCase} from 'lodash'
import {readdir, readFile} from 'mz/fs'
import matter from 'gray-matter'
import path from 'path'
import webpack from 'webpack'
import {ReportChunks} from 'react-universal-component'
import flushChunks from 'webpack-flush-chunks'

const resolve = p => path.resolve(__dirname, p)
const nodeModules = resolve('./node_modules')

// for SSR of dynamic imports
const externals = fs
    .readdirSync(nodeModules)
    .filter(
        moduleName =>
            !/\.bin|require-universal-module|react-universal-component|webpack-flush-chunks/.test(
                moduleName,
            ),
    )
    .reduce((externals, moduleName) => {
        externals[moduleName] = moduleName
        return externals
    }, {})

const parseMarkdownFiles = async () => {
    let markdownFiles = await readdir('./docs');
    let allMarkdownContent = await Promise.all(
        markdownFiles.map((filePath) => {
            return readFile(
                path.resolve('.', 'docs', filePath),
                'utf8'
            ).then(markdownContent => {
                return {
                    contents: markdownContent,
                    title: filePath.split('.md').join('')
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

const getPosts = async () => {
    return (await parseMarkdownFiles())
        .map((parsedMarkdown) => {
            return {
                id: kebabCase(parsedMarkdown.title),
                title: parsedMarkdown.title || startCase(parsedMarkdown.title),
                ...parsedMarkdown.contents.data,
                body: parsedMarkdown.contents.content
            };
        });
};

const STATIC_ROUTES = [{
    path: '/',
    component: 'src/containers/Home',
},
    {
        path: '/about',
        component: 'src/containers/About',
    }];

const getProps = (props, key) => () => ({
    [key]: props
});

const getDocument = ({Html, Head, Body, children, renderMeta}) => (
    <Html lang="en-US">
    <Head>
        <meta charSet="UTF-8"/>
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0"
        />
    </Head>
    <Body className="slug-home">
    {children}
    {
        renderMeta.scripts &&
        renderMeta.scripts.map(script => <script type="text/javascript" src={`/${script}`}/>)
    }
    </Body>
    </Html>
);

const handleWebpackBuild = (config, {stage}) => {
    if (stage === 'node') {
        config.externals = externals

        config.plugins.push(
            new webpack.optimize.LimitChunkCountPlugin({
                maxChunks: 1,
            }),
        )
    }

    if (stage === 'prod') {
        config.output.filename = 'app.[chunkHash:6].js'
        config.output.chunkFilename = '[name].[chunkHash:6].js'

        config.plugins.push(
            new webpack.optimize.CommonsChunkPlugin({
                name: 'bootstrap',
                filename: 'bootstrap.[chunkHash:6].js',
                minChunks: Infinity,
            }),
        )
    }

    return config
};

const renderToHtml = (renderToString, App, meta, prodStats) => {
    const chunkNames = []
    const appHtml = renderToString(
        <ReportChunks report={chunkName => chunkNames.push(chunkName)}>
            <App/>
        </ReportChunks>,
    )

    const {scripts} = flushChunks(prodStats, {
        chunkNames,
    })

    meta.scripts = scripts.filter(script => script.split('.')[0] !== 'app')
    return appHtml
};

export default {
    getSiteProps: () => ({
        title: 'React Static',
    }),
    getRoutes: async () => {
        let posts = await getPosts();

        return [
            ...STATIC_ROUTES, {
                path: '/blog',
                component: 'src/containers/Blog',
                getProps: getProps(posts, 'posts'),
                children: posts.map(post => ({
                    path: `/post/${post.id}`,
                    component: 'src/containers/Post',
                    getProps: getProps(post, 'post'),
                })),
            }, {
                is404: true,
                component: 'src/containers/404',
            },
        ]
    },
    renderToHtml,
    Document: getDocument,
    webpack: handleWebpackBuild
}
