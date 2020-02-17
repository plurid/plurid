import React from 'react';

import {
    PluridContext,
} from '@plurid/plurid-data';



const defaultContext: PluridContext = {
    documents: {},
}

const Context = React.createContext(defaultContext);


export default Context;
