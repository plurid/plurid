import React from 'react';

import {
    PluridMetastate,
} from '@plurid/plurid-data';



const Context = React.createContext<PluridMetastate | null>(null);


export default Context;
