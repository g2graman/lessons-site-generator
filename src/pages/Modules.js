
import React from 'react'
import { getRouteProps, Link } from 'react-static'

export default getRouteProps(({ modules }) => (
  <div>
    <br />
    All Modules:
    <ul>
      {
          modules.map(bridgeModule => (
            <li key={bridgeModule.id}>
              <Link to={`/modules/${bridgeModule.id}/`}>{bridgeModule.title}</Link>
            </li>
          ))
      }
    </ul>
  </div>
))
