import React from 'react'
import { Link } from 'react-static'

import './navbar.css';

export default () => (
  <nav>
    <Link to="/">Modules</Link>
    <Link to="/about">About</Link>
  </nav>
);