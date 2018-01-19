import React from "react";
import { kebabCase, startCase, pick } from "lodash";
import { readFile } from "mz/fs";
import glob from "glob-promise";
import matter from "gray-matter";
import path from "path";

import CDNConfig from "./config/cdn.json";
import marked from "./config/marked";

const NPM_SCRIPT_USED = process.env.npm_lifecycle_event;

const ROOT_CONTENT_DIR = path.resolve(".", "bridge", "resources");

const parseMarkdownFiles = async () => {
  const markdownFiles = await glob(
    path.resolve(ROOT_CONTENT_DIR, "**", "*.md")
  );

  const allMarkdownContent = await Promise.all(
    markdownFiles.map(filePath =>
      readFile(path.resolve(".", "docs", filePath), "utf8").then(
        markdownContent => ({
          contents: markdownContent,
          title: startCase(path.basename(filePath.split(".md").join(""))),
          path: path
            .relative(ROOT_CONTENT_DIR, filePath)
            .split(".md")
            .join("")
        })
      )
    )
  );

  return allMarkdownContent.map(markdownFile => ({
    ...markdownFile,
    contents: matter(markdownFile.contents)
  }));
};

const getModules = async () =>
  (await parseMarkdownFiles()).map(parsedMarkdown => ({
    ...pick(parsedMarkdown, ["contents.data", "title", "path"]),
    id: kebabCase(parsedMarkdown.title),
    body: marked(parsedMarkdown.contents.content)
  }));

const STATIC_ROUTES = [
  {
    path: "/about",
    component: "src/pages/about/about"
  }
];

const getProps = (props, key) => () => ({
  [key]: props
});

const getDocument = ({ Html, Head, Body, children, renderMeta }) => (
  <Html lang="en-US">
    <Head>
      <meta charSet="UTF-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0"
      />
      {CDNConfig.styles.map((CDNStyleURL, index) => (
        <link
          key={["style", index].join("-")}
          rel="stylesheet"
          href={CDNStyleURL}
        />
      ))}
    </Head>
    <Body>
      <div className="slug-home">
        {children}
        {renderMeta.scripts &&
          renderMeta.scripts.map(script => (
            <script type="text/javascript" src={`/${script}`} />
          ))}
      </div>
    </Body>
  </Html>
);

const handleWebpackBuild = (config, { defaultLoaders }) => {
  config.module.rules = [
    {
      oneOf: [
        {
          test: /\.svg$/,
          exclude: /node_modules/,
          use: [
            "babel-loader",
            {
              loader: "react-svg-loader", // 'react-svg'
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
        defaultLoaders.fileLoader
      ]
    }
  ];

  return config;
};

export default {
  siteRoot:
    NPM_SCRIPT_USED === "pages"
      ? "https://g2graman.github.io/lessons-site-generator"
      : null,
  getSiteProps: () => ({
    title: "React Static"
  }),
  getRoutes: async () => {
    const modules = await getModules();

    return [
      ...STATIC_ROUTES,
      {
        path: "/",
        component: "src/pages/modules/modules",
        getProps: getProps(modules, "modules"),
        children: modules.map(bridgeModule => ({
          path: ["modules", bridgeModule.path].join("/"),
          component: "src/pages/modules/module/module",
          getProps: getProps(bridgeModule, "module")
        }))
      },
      {
        is404: true,
        component: "src/pages/404/404"
      }
    ];
  },
  Document: getDocument,
  webpack: handleWebpackBuild
};
