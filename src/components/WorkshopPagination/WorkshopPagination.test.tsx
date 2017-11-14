import { render, configure } from "enzyme";
import "jest";
import * as React from "react";
import WorkshopPagination from "./WorkshopPagination";
import { LINK as WORKSHOP_LINK } from "../../pages/workshop";

// Configure enzyme with react 16 adapter
const Adapter: any = require("enzyme-adapter-react-16");
configure({ adapter: new Adapter() });

const LinkStub = ((props: any) => <div {...props} />) as any;

describe("WorkshopPagination component", () => {
  it("should render nothing if only 1 page", () => {
    const pathname: string = `/${WORKSHOP_LINK}/page/1/`;
    const pageCount: number = 1;

    const wrapper = render(<WorkshopPagination pathname={pathname} Link={LinkStub} pageCount={pageCount} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("should render correctly 5 pages", () => {
    const pathname: string = `/${WORKSHOP_LINK}/page/2/`;
    const pageCount: number = 5;

    const wrapper = render(<WorkshopPagination pathname={pathname} Link={LinkStub} pageCount={pageCount} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("should render correctly 10 pages", () => {
    const pathname: string = `/${WORKSHOP_LINK}/page/5/`;
    const pageCount: number = 10;

    const wrapper = render(<WorkshopPagination pathname={pathname} Link={LinkStub} pageCount={pageCount} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("should render correctly 20 pages", () => {
    const pathname: string = `/${WORKSHOP_LINK}/page/5/`;
    const pageCount: number = 20;

    const wrapper = render(<WorkshopPagination pathname={pathname} Link={LinkStub} pageCount={pageCount} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("should have first link active if no match", () => {
    const pathname: string = "/plop";
    const pageCount: number = 10;

    const wrapper = render(<WorkshopPagination pathname={pathname} Link={LinkStub} pageCount={pageCount} />);
    expect(wrapper).toMatchSnapshot();
  });
});
