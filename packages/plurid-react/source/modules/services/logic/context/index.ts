import React from 'react';

import {
    PluridContext,
} from '@plurid/plurid-data';



const defaultContext: PluridContext = {
    universes: {},
    indexedPlanes: new Map(),
    indexedPlanesSources: new Map(),
}

const Context = React.createContext(defaultContext);


export default Context;
