import React from 'react';

import {
    PluridContext,
} from '@plurid/plurid-data';



const defaultContext: PluridContext = {
    planesRegistry: new Map(),
    // planesProperties: new Map(),
}

const Context = React.createContext(defaultContext);


export default Context;
