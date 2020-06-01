import React from 'react';

import {
    GlobalStyle,
} from './styled';



const Shell = (
    properties,
) => {
    /** properties */
    const {
        children,
    } = properties;


    /** render */
    return (
        <>
            <GlobalStyle />

            {children}
        </>
    );
}


const shell = {
    kind: 'react',
    element: Shell,
};


export default shell;
