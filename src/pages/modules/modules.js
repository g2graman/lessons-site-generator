import React from "react";
import { getRouteProps, Link } from "react-static";
import { get, merge } from "lodash";

import Footer from "../../components/footer/footer";

const getModuleFromPath = (modules, modulePath) =>
  modules.find(bridgeModule => bridgeModule.path === modulePath);

const convertFilePathToJSON = (
  modules,
  filePath,
  acc = {},
  DELIMITER = "/"
) => {
  if (!filePath) {
    return acc;
  }

  const [childDir, ...nestedPath] = filePath.split(DELIMITER);

  if (childDir) {
    if (nestedPath.length > 1) {
      return {
        ...acc,
        [childDir]: {
          ...convertFilePathToJSON(
            modules,
            nestedPath.join(DELIMITER),
            acc,
            DELIMITER
          )
        }
      };
    }

    // nestedPath.length === <= 1

    const fullPath = [childDir].concat(nestedPath).join(DELIMITER);
    const remainingPath = nestedPath.join(DELIMITER);

    const leaf = convertFilePathToJSON(
      modules,
      remainingPath,
      get(acc, childDir, {}),
      DELIMITER
    );

    return {
      ...acc,
      [childDir]: merge(
        leaf,
        nestedPath.length
          ? { [remainingPath]: getModuleFromPath(modules, fullPath) } // nestedPath === 1
          : getModuleFromPath(modules, fullPath) // nestedPath === 0
      )
    };
  }

  return acc;
};

const getFileTree = modules =>
  modules.map(bridgeModule => bridgeModule.path).reduce(
    (acc, next) => ({
      ...acc,
      ...convertFilePathToJSON(modules, next, acc)
    }),
    {}
  );

const getModuleLink = (bridgeModule, withPrefix = true, DELIMITER = "/") =>
  (withPrefix ? ["modules"] : []).concat([bridgeModule.path]).join(DELIMITER);

const makeModuleLink = bridgeModule => (
  <li style={{ listStyle: "none" }} key={bridgeModule.id}>
    <Link to={getModuleLink(bridgeModule)}>{bridgeModule.title}</Link>
  </li>
);

const makeModuleLinks = modules => modules.map(makeModuleLink);

const makeModuleTree = rootModulesWithChildren =>
  Object.entries(rootModulesWithChildren).map(([rootModuleKey, rootModule]) => {
    if (rootModule.title) {
      // if the module is a leaf in the tree, don't recurse
      return makeModuleLink(rootModule);
    }

    const rootModuleName = /^\d+/.test(rootModuleKey)
      ? rootModuleKey
          .split("-")
          .slice(1) // name started with number; remove first chunk
          .join(" ") // replace what would have been dashes with spaces
      : rootModuleKey;

    return (
      <li style={{ listStyle: "none" }} key={rootModuleKey}>
        {rootModuleName} <ul>{makeModuleTree(rootModule)}</ul>
      </li>
    );
  });

const getBarrenRootModules = modules =>
  Object.entries(getFileTree(modules))
    // eslint-disable-next-line no-unused-vars
    .filter(([key, value]) => !!value.title) // TODO: match to whole interface (check for id, path, contents, data, etc)
    // eslint-disable-next-line no-unused-vars
    .map(([_, moduleMetadata]) => moduleMetadata); // only keep the module metadata

const getRootModulesWithChildren = modules => {
  const moduleTree = getFileTree(modules);

  return merge(
    // merge all the root modules into one object, forming a sub-object of the modules map
    ...Object.entries(moduleTree)
      // eslint-disable-next-line no-unused-vars
      .filter(([key, value]) => !value.title) // TODO: match to whole interface (check for id, path, contents, data, etc)
      // eslint-disable-next-line no-unused-vars
      .map(([moduleKey, _]) => ({
        [moduleKey]: get(moduleTree, moduleKey, {})
      }))
  );
};

const makeModuleList = modules => (
  <ul>
    {makeModuleLinks(getBarrenRootModules(modules))}
    {makeModuleTree(getRootModulesWithChildren(modules))}
  </ul>
);

export default getRouteProps(({ modules }) => (
  <div>
    <br />
    All Modules:
    {makeModuleList(modules)}
    <Footer />
  </div>
));
