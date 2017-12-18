import React from 'react'
import Layout from '../components/layout'

const App = ({ title, toc, contents, pkg, root }) =>
  <Layout
    className="wrap container-fluid"
    title={title}
    toc={toc}
    pkg={pkg}
    root={root}
  >
    <div
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: contents }}
    />
  </Layout>

export default App
