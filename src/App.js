import React from 'react'
import { Router } from 'react-static'

import Routes from 'react-static-routes'

import './app.css'
import Navbar from './components/Navbar/Navbar';

export default () => (
  <Router>
    <div>
      <Navbar/>
      <div className="content">
        <Routes />
      </div>
    </div>
  </Router>
)
