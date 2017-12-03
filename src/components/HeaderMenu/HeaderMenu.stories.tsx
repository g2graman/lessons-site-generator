/* tslint:disable no-var-requires */
const withReadme = (require("storybook-readme/with-readme") as any).default;
const HeaderMenuReadme = require("./README.md");

import * as React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { withKnobs, text, boolean } from "@storybook/addon-knobs";
import { HeaderMenu } from "./HeaderMenu";

import {LINK as WORKSHOP_LINK, NAME as WORKSHOP_NAME} from "../../pages/workshop";
import {LINK as ABOUT_LINK, NAME as ABOUT_NAME} from "../../pages/about";
import {LINK as HOME_LINK, NAME as HOME_NAME} from "../../pages/index";

const items = [
  { name: HOME_NAME, path: HOME_LINK, exact: true },
  { name: ABOUT_NAME, path: ABOUT_LINK, exact: false },
  { name: WORKSHOP_NAME, path: WORKSHOP_LINK, exact: false },
];

const LinkStub = (props: any) =>
  <div {...props} onClick={action(props.to.toString())} >{props.children}</div>;
const dispatchStub = (a: any) => action(a.type)(a) && a;

storiesOf("HeaderMenu", module)
  .addDecorator(withKnobs)
  .addDecorator(withReadme(HeaderMenuReadme))
  .add("default", () => {
    const pathname = text("pathname", "/");
    const inverted = boolean("inverted", false);

    return (
      <HeaderMenu Link={LinkStub} items={items} pathname={pathname} inverted={inverted} dispatch={dispatchStub} />
    );
  });

export {items as links};
