import React from 'react';

import {
    PluridComponent,
} from '@plurid/plurid-react';

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


const shell: PluridComponent = {
    kind: 'react',
    element: Shell,
};


export default shell;
