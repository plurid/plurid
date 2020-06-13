import React from 'react';

import {
    PluridMetastate,
} from '@plurid/plurid-data';



const PluridContext = React.createContext<PluridMetastate | undefined>(undefined);


export default PluridContext;
