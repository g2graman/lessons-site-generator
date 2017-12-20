import React from 'react'
import { Link } from 'react-static'
import {Toolbar, ToolbarRow, ToolbarTitle, ToolbarSection} from 'rmwc/Toolbar';

import './navbar.css';
import Logo from './logo.svg';

export default () => (
  <Toolbar>
    <ToolbarRow>
      <ToolbarSection alignStart className="brand">
        <Logo width={48} height={48}/>
      </ToolbarSection>
      <ToolbarSection className="navigation">
        <nav>
          <Link to="/">Modules</Link>
          <Link to="/about">About</Link>
        </nav>
      </ToolbarSection>
    </ToolbarRow>
  </Toolbar>
);