import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconFrame: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M707.5,146H840.23A17.21,17.21,0,0,1,857,162.77V292.5H957V162.77C957,98.55,904.45,46,840.23,46H707.5Z"/>
                <path d="M149,292.5V162.77A17.22,17.22,0,0,1,165.78,146H292.5V46H165.78C101.55,46,49,98.55,49,162.77V292.5Z"/>
                <path d="M857,707.5V837.23A17.21,17.21,0,0,1,840.23,854H707.5V954H840.23C904.45,954,957,901.45,957,837.23V707.5Z"/>
                <path d="M292.5,854H165.78A17.22,17.22,0,0,1,149,837.23V707.5H49V837.23C49,901.45,101.55,954,165.78,954H292.5Z"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconFrame;
