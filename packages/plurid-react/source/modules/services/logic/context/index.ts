import React from 'react';

import {
    PluridContext,
} from '@plurid/plurid-data';



const defaultContext: PluridContext = {
    universes: {},
}

const Context = React.createContext(defaultContext);


export default Context;
