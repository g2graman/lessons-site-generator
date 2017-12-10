# Gatsby 1.0 starter

[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![Build Status](https://travis-ci.org/fabien0102/gatsby-starter.svg?branch=master)](https://travis-ci.org/fabien0102/gatsby-starter)
[![Build status](https://ci.appveyor.com/api/projects/status/k06pajqcm23lay1s/branch/master?svg=true)](https://ci.appveyor.com/project/fabien0102/gatsby-starter/branch/master)
[![Code Climate](https://codeclimate.com/github/fabien0102/gatsby-starter/badges/gpa.svg)](https://codeclimate.com/github/fabien0102/gatsby-starter)
[![Test Coverage](https://codeclimate.com/github/fabien0102/gatsby-starter/badges/coverage.svg)](https://codeclimate.com/github/fabien0102/gatsby-starter/coverage)

Demo: <https://fabien0102-gatsby-starter.netlify.com/>

Gatsby 1.0 starter for generate awesome static website working with a nice env development.

## Warning

This starter is currently in wip (see progression to #What's inside session).

## Getting started

Install this starter (assuming Gatsby is installed) by running from your CLI: 

```bash
$ gatsby new my-website https://github.com/fabien0102/gatsby-starter
```

Run `yarn start` (or press `F5` if you are on VSCode) to hot-serve your website on <http://localhost:8000>.

Run `yarn build` to create static site ready to host (`/public`)

## What's inside?

-   [ ] Gatsby 1.0 (alpha)
    -   [x] sharp
    -   [x] offline support
    -   [ ] google analytics
    -   [x] manifest
    -   [x] typescript
    -   [x] blog in markdown
-   [x] Best practices tools
    -   [x] [Jest](https://facebook.github.io/jest/) / [Enzyme](http://airbnb.io/enzyme/)
    -   [x] [Typescript](https://www.typescriptlang.org/) / [tslint](https://palantir.github.io/tslint/)
    -   [x] [xo linter](https://github.com/sindresorhus/xo)
    -   [x] [Remark-lint](https://github.com/wooorm/remark-lint)
    -   [x] [Husky](https://github.com/typicode/husky) & [lint-staged](https://github.com/okonet/lint-staged) for autofix each commit
    -   [x] Travis/AppVeyor config (unix-osx-windows CI)
    -   [x] Code climate config
-   [ ] SEO
    -   [ ] [Helmet](https://github.com/nfl/react-helmet)
-   [x] [Semantic-ui](http://react.semantic-ui.com) for styling

## Files structure

     .
     ├── data                          // website data (included into graphQL)
     │   ├── author.json               // list of blog authors
     │   ├── avatars                   // authors avatars
     │   └── blog                      // all blog data (posts, images)
     ├── gatsby-config.js              // gatsby configuration
     ├── gatsby-node.js                // gatsby node hooks
     ├── package.json
     ├── public                        // output folder (in .gitignore)
     ├── README.md                     // this file
     ├── src                           // sources
     │   ├── components                // all react components
     │   ├── css                       // styles
     │   ├── declarations.d.ts         // declarations for no typescript modules/files
     │   ├── graphql-types.d.ts        // graphql types (`yarn graphql-types`)
     │   ├── html.tsx                  // main html (required)
     │   ├── layouts                   // layouts
     │   │   └── default.tsx           // default layout (required)
     │   ├── pages                     // all pages
     │   └── templates                 // all templates (used for procedural page creation, see `gatsby-node.js`)
     ├── tools                         // miscs tools for dev
     │   └── update-post-date.js       // update post date hook
     ├── tsconfig.json                 // typescript configuration
     ├── tslint.json                   // tslint configuration
     └── yarn.lock                     // yarn lock file

# Development Tools

## GraphiQL

After running the development server with `npm run develop`, and once it has generated the static site, you can go to `http://localhost:8000/___graphql` and run interactive GraphQL queries if you want to see what data those queries return.

There are also sample queries stored under `./queries`. For example, if you take `./queries/BlogPages.query` and paste the contents at the page at `http://localhost:8000/___graphql`, you can get a query which returns the data representing all the blog pages.
