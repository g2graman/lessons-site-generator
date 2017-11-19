import * as React from "react";
import * as PropTypes from "prop-types";
import Link from "gatsby-link";
import HeaderMenu from "../components/HeaderMenu/HeaderMenu";
import { menuItems } from "../layouts";
import {
  Button,
  Segment,
  Container,
  Grid,
  Header,
  Icon,
} from "semantic-ui-react";

import IPageMetaData from "./helpers/IPageMetadata";
import PageDecorators from "./helpers/decorators";

interface IndexPageProps {
  location: {
    pathname: string;
  };
}

@PageDecorators.setPageMetadata({
    LINK: '/home',
    NAME: 'Home'
})
export default class IndexPageComponent extends React.Component {
    props: IndexPageProps;
    constructor(props: IndexPageProps) {
        super(props);
    }

    render() {
        let {props} = this;

        return (
            <div>
                {/* Master head */}
                <Segment vertical inverted textAlign="center" className="masthead">
                    <HeaderMenu
                        Link={Link} pathname={props.location.pathname} items={menuItems} inverted
                    />
                    <Container text>
                        <Header inverted as="h1">Gatsby 1.0 - Starter kit</Header>
                        <Header inverted as="h2">Typescript - Jest - Semantic UI</Header>
                        <Button primary size="huge">Get started!</Button>
                    </Container>
                </Segment>

                {/* About this starter */}
                <Segment vertical className="stripe">
                    <Grid stackable verticalAlign="middle" className="container">
                        <Grid.Row>
                            <Grid.Column width="8">
                                <Header>Lorem ipsum</Header>
                                <p>
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                    Porro laudantium ad, quae, perspiciatis ipsa distinctio.
                                </p>
                                <Header>Dolor sit amet</Header>
                                <p>
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                    Porro laudantium ad, quae, perspiciatis ipsa distinctio.
                                </p>
                            </Grid.Column>
                            <Grid.Column width="6" floated="right">
                                {/* TODO replace with a pretty GIF */}
                                <Header>Lorem ipsum</Header>
                                <p>
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                    Porro laudantium ad, quae, perspiciatis ipsa distinctio.
                                </p>
                                <Header>Dolor sit amet</Header>
                                <p>
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                    Porro laudantium ad, quae, perspiciatis ipsa distinctio.
                                </p>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>

                {/* Key features */}
                <Segment vertical className="stripe alternate feature">
                    <Grid columns="3" textAlign="center" divided relaxed stackable className="container">
                        <Grid.Row>
                            <Grid.Column>
                                <Header icon>
                                    <Icon name="wizard"></Icon>
                                    A kind of magic!
                                </Header>
                                <p>
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                    Voluptas eaque at quae cupiditate aspernatur quibusdam!
                                    Distinctio quod non, harum dolorum earum molestias,
                                    beatae expedita aliquam dolorem asperiores nemo amet quaerat.
                                </p>
                            </Grid.Column>
                            <Grid.Column>
                                <Header icon>
                                    <Icon name="wizard"></Icon>
                                    A kind of magic!
                                </Header>
                                <p>
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                    Voluptas eaque at quae cupiditate aspernatur quibusdam!
                                    Distinctio quod non, harum dolorum earum molestias,
                                    beatae expedita aliquam dolorem asperiores nemo amet quaerat.
                                </p>
                            </Grid.Column>
                            <Grid.Column>
                                <Header icon>
                                    <Icon name="wizard"></Icon>
                                    A kind of magic!
                                </Header>
                                <p>
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                    Voluptas eaque at quae cupiditate aspernatur quibusdam!
                                    Distinctio quod non, harum dolorum earum molestias,
                                    beatae expedita aliquam dolorem asperiores nemo amet quaerat.
                                </p>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
            </div>
        );
    }
}

console.log(IndexPageComponent);