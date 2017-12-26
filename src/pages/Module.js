import React from "react";
import { getRouteProps, Link } from "react-static";
import { Button } from "rmwc/Button";

import "./module.css";

export default getRouteProps(({ module }) => (
  <div>
    <Link to="/">
      <Button stroked>Back to Modules</Button>
    </Link>
    <br />
    <h3>{module.title}</h3>
    <p dangerouslySetInnerHTML={{ __html: module.body }} />
  </div>
));
