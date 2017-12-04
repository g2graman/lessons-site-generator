/* tslint:disable no-var-requires */
const withReadme = (require("storybook-readme/with-readme") as any).default;
const SidebarMenuReadme = require("./README.md");

import * as React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { withKnobs, text, boolean } from "@storybook/addon-knobs";
import { SidebarMenu } from "./SidebarMenu";

import {LINK as WORKSHOP_LINK, NAME as WORKSHOP_NAME} from "../../pages/workshop/workshop-metadata.const";
import {LINK as ABOUT_LINK, NAME as ABOUT_NAME} from "../../pages/about";
import {LINK as HOME_LINK, NAME as HOME_NAME} from "../../pages/index";

const items = [
  { name: HOME_NAME, path: HOME_LINK, exact: true, icon: "home" },
  { name: ABOUT_NAME, path: ABOUT_LINK, exact: false, icon: "info circle" },
  { name: WORKSHOP_NAME, path: WORKSHOP_LINK, exact: false, icon: "newspaper" },
];

const LinkStub: any = (props: any) =>
  <div {...props} onClick={action(props.to.toString())} >{props.children}</div>;

storiesOf("SidebarMenu", module)
  .addDecorator(withKnobs)
  .addDecorator(withReadme(SidebarMenuReadme))
  .add("default", () => {
    const pathname = text("pathname", "/");

    return (
      <SidebarMenu Link={LinkStub} items={items} pathname={pathname} visible />
    );
  });
