import React, { Component } from 'react';

export default class extends Component {
  render() {
    return <p style={{
        float: 'left',
        width: '100%',
        textAlign: 'center',
        position: 'absolute',
        bottom: 0,
        height: '60px'
    }}>
      Feedback? Let us know at
        <a style={{paddingLeft: '5px' }} href='mailto:hello@bridgeschool.io'>
          hello@bridgeschool.io
        </a>
    </p>;
  }
}