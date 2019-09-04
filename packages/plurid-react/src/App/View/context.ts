import React from 'react';

import {
    PluridAppContext,
} from '../../modules/data/interfaces';



const defaultContext: PluridAppContext = {
    pages: [],
    documents: [],
}

const Context = React.createContext(defaultContext);


export default Context;
