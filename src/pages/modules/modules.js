import React from "react";
import { getRouteProps, Link } from "react-static";
import { get } from "lodash";

import Footer from "../../components/footer/footer";

const convertFilePathToJSON = (filePath, acc = {}) => {
  const [childDir, ...nestedPath] = filePath.split("/");

  if (childDir) {
    return {
      [childDir]:
        nestedPath.length > 1
          ? {
              ...convertFilePathToJSON(
                nestedPath.join("/"),
                get(acc, childDir, {})
              )
            }
          : [...nestedPath, ...get(acc, [childDir].join("."), [])]
    };
  }

  return acc;
};

const getFileTree = relativeFilePaths =>
  relativeFilePaths.reduce(
    (acc, next) => ({
      ...acc,
      ...convertFilePathToJSON(next, acc)
    }),
    {}
  );

const getModuleLink = (bridgeModule, withPrefix = true) =>
  (withPrefix ? ["modules"] : []).concat([bridgeModule.path]).join("/");

const makeModuleLinks = modules => {
  /* console.log(modules); */

  console.log(getFileTree(modules.map(bridgeModule => bridgeModule.path)));
  /*
    Object.entries(
        getFileTree(modules.map(bridgeModule => bridgeModule.path))
    ).reduce((acc, [key, value]) => {
        // if ()
        console.log(acc, key, value);
        return acc;
    }, {}); */

  return modules.map(bridgeModule => (
    <li key={bridgeModule.id}>
      <Link to={getModuleLink(bridgeModule)}>{bridgeModule.title}</Link>
    </li>
  ));
};

export default getRouteProps(({ modules }) => (
  <div>
    <br />
    All Modules:
    <ul>{makeModuleLinks(modules)}</ul>
    <Footer />
  </div>
));
