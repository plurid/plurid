import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconText: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M609.08,134.79H794L822,301.4h82.54L896,67.52H172.41L163.59,301.4h82.84l28-166.61H459c2.25,111.55,2.25,223.69,2.25,334.94v60.06c0,112,0,223-2.16,331.81L331.78,875v57H736.71V875L609.08,861.65c-2.18-110.53-2.19-221.67-2.19-332.12v-59.8C606.88,356.69,606.89,244.56,609.08,134.79Z" />
            </svg>
        </PluridIcon>
    );
}


export default PluridIconText;
