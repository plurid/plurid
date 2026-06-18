import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconExpandPlus: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M921.83,422.83H577.17V78.17A77.17,77.17,0,0,0,500,1h0a77.17,77.17,0,0,0-77.17,77.17V422.83H78.17A77.17,77.17,0,0,0,1,500H1a77.17,77.17,0,0,0,77.17,77.17H422.83V921.83A77.17,77.17,0,0,0,500,999h0a77.17,77.17,0,0,0,77.17-77.17V577.17H921.83A77.17,77.17,0,0,0,999,500h0A77.17,77.17,0,0,0,921.83,422.83Z"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconExpandPlus;
