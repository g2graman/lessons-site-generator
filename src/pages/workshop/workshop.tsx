import * as React from "react";
import Link from "gatsby-link";
import { Grid, Card, Container, Segment, Comment } from "semantic-ui-react";
import {ImageSharp } from "../../graphql-types";
import BlogTitle from "../../components/WorkshopTitle";
import TagsCard from "../../components/TagsCard/TagsCard";
import WorkshopPagination from "../../components/WorkshopPagination/WorkshopPagination";

import { WorkshopProps } from "./workshop-props.interface";
import { QUERY } from "./workshop-query";

export const pageQuery = QUERY;

export default (props: WorkshopProps) => {
  const tags = props.data.tags.group;
  const posts = props.data.posts.edges;
  const { pathname } = props.location;
  const pageCount = Math.ceil(props.data.posts.totalCount / 10);

  // TODO export posts in a proper component
  const Posts = (
    <Container>
      {posts.map(({ node }) => {
        const { frontmatter, timeToRead, fields: { slug }, excerpt } = node;
        const avatar = frontmatter.author.avatar.children[0] as ImageSharp;
        const cover = frontmatter.image.children[0] as ImageSharp;

        const extra = (
          <Comment.Group>
            <Comment>
              <Comment.Avatar
                src={avatar.responsiveResolution.src}
                srcSet={avatar.responsiveResolution.srcSet}
              />
              <Comment.Content>
                <Comment.Author style={{ fontWeight: 400 }}>
                  {frontmatter.author.id}
                </Comment.Author>
                <Comment.Metadata style={{ margin: 0 }}>
                  {frontmatter.updatedDate} - {timeToRead} min read
              </Comment.Metadata>
              </Comment.Content>
            </Comment>
          </Comment.Group>
        );

        const description = (
          <Card.Description>
            {excerpt}
            <br />
            <Link to={slug}>Read more…</Link>
          </Card.Description>
        );

        return (
          <Card key={slug}
            fluid
            image={{
              src: cover.responsiveResolution.src,
              srcSet: cover.responsiveResolution.srcSet,
            }}
            header={frontmatter.title}
            extra={extra}
            description={description}
          />
        );
      })}
    </Container>
  );

  return (
    <Container>
      {/* Title */}
      <BlogTitle />

      {/* Content */}
      <Segment vertical>
        <Grid padded style={{ justifyContent: "space-around" }}>
          <div style={{ maxWidth: 600 }}>
            {Posts}
            <Segment vertical textAlign="center">
              <WorkshopPagination Link={Link} pathname={pathname} pageCount={pageCount} />
            </Segment>
          </div>
          <div>
            <TagsCard Link={Link} tags={tags} tag={props.pathContext.tag} />
          </div>
        </Grid>
      </Segment>
    </Container>
  );
};
