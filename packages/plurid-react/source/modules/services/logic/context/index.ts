import React from 'react';

import {
    PluridContext,
} from '@plurid/plurid-data';



const defaultContext: PluridContext = {
    planesMap: new Map(),
}

const Context = React.createContext(defaultContext);


export default Context;
