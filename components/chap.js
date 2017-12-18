import React from 'react'

export default ({ children, title }) => (
    <div className="chap">
        <span className="chap-title">{title}</span>
        <ul>
            {children}
        </ul>
    </div>
);
