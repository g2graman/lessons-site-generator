import React from 'react'
import { getRouteProps, Link } from 'react-static'

export default getRouteProps(({ module }) => (
  <div>
    <Link to="/">{'<'} Back</Link>
    <br />
    <h3>{module.title}</h3>
    <p dangerouslySetInnerHTML={{ __html: module.body }} />
  </div>
))
