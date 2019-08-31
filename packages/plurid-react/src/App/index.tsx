import React from 'react';

import {
    PluridPage,
    PluridDocument,
    PluridAppConfiguration,
} from '../modules/data/interfaces';



export interface PluridAppOwnProperties {
    pages?: PluridPage[],
    documents?: PluridDocument[],
    configuration?: PluridAppConfiguration,
}

const PluridApp: React.FC<PluridAppOwnProperties> = () => {

    return (
        <div>
            plurid app
        </div>
    );
}

export default PluridApp;