import React from "react";
import { getRouteProps, Link } from "react-static";

import Footer from "../../components/footer/footer";

const makeModuleLinks = modules =>
  modules.map(bridgeModule => (
    <li key={bridgeModule.id}>
      <Link to={`/modules/${bridgeModule.id}/`}>{bridgeModule.title}</Link>
    </li>
  ));

export default getRouteProps(({ modules }) => (
  <div>
    <br />
    All Modules:
    <ul style={{ listStyle: "none" }}>{makeModuleLinks(modules)}</ul>
    <Footer />
  </div>
));
