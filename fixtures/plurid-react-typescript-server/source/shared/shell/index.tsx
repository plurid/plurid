import React from 'react'

import {
    GlobalStyle,
} from './styled';



interface ShellProperties {
}


const Shell: React.FC<ShellProperties> = (
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


export default Shell;
