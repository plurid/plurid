import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconSave: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <g>
                    <path d="M508.71,694.14,270.12,388.87h11.23c48.9-.12,97.8-.5,146.7-.14,9.33.07,11-3.12,11-11.59q-.42-144.94-.22-289.9V72.91H572.37v9.57c0,98.39.17,196.79-.21,295.18,0,9.33,2.85,11,11.37,11,49.78-.38,99.57-.21,149.35-.23h10.37Z"/>
                    <path d="M508.71,694.14,270.12,388.87h11.23c48.9-.12,97.8-.5,146.7-.14,9.33.07,11-3.12,11-11.59q-.42-144.94-.22-289.9V72.91H572.37v9.57c0,98.39.17,196.79-.21,295.18,0,9.33,2.85,11,11.37,11,49.78-.38,99.57-.21,149.35-.23h10.37Z"/>
                </g>
                <g>
                    <polygon points="54 621 54 933.32 950.58 933.32 951 621 836 621 836 819 164 819 164 621 54 621"/>
                    <polygon points="54 621 54 933.32 950.58 933.32 951 621 836 621 836 819 164 819 164 621 54 621"/>
                </g>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconSave;
