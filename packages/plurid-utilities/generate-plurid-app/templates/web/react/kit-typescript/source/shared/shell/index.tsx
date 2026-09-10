import React from 'react';



/** Wraps every route's content: the place for a global header, footer or provider. */
const Shell: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
    <>
        {children}
    </>
);


export default Shell;
