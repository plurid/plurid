import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconColumns: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M225,91V909H100a40,40,0,0,1-40-40V131a40,40,0,0,1,40-40H225m60-60H100A100,100,0,0,0,0,131V869A100,100,0,0,0,100,969H285V31Z"/>
                <path d="M582.5,91V909h-165V91h165m60-60h-285V969h285V31Z"/>
                <path d="M900,91a40,40,0,0,1,40,40V869a40,40,0,0,1-40,40H775V91H900m0-60H715V969H900a100,100,0,0,0,100-100V131A100,100,0,0,0,900,31Z"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconColumns;
