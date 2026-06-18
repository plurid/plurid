import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconShare: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M803,616a159.59,159.59,0,0,0-119.76,53.92L356.82,534.53c.11-2.49.18-5,.18-7.53a160.45,160.45,0,0,0-3.83-34.89L577.73,348.67a159.71,159.71,0,1,0-56.14-90.87L296.42,401.64a160,160,0,1,0,20.05,231.78l326.69,135.5c-.1,2.35-.16,4.71-.16,7.08A160,160,0,1,0,803,616ZM197,626a99,99,0,1,1,99-99A99,99,0,0,1,197,626Z"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconShare;
