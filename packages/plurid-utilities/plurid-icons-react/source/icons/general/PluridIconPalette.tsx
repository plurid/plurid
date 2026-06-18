import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconPalette: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M401.5,718,608.27,217.79a58.5,58.5,0,0,0-31.44-76.29L401.5,68Z"/>
                <path d="M427,791.5,802.39,414.3a58.49,58.49,0,0,0,1.46-81L667,185.5Z"/>
                <path d="M414,871.5,916.73,666.25a58.48,58.48,0,0,0,32.39-75.37L875,400.5Z"/>
                <path d="M378,945.5H922.51A58.49,58.49,0,0,0,981,887V695.5Z"/>
                <path d="M285.46,55H96.83A77.33,77.33,0,0,0,19.5,132.33V868.67A77.33,77.33,0,0,0,96.83,946H285.46a66,66,0,0,0,66-66V121A66,66,0,0,0,285.46,55ZM224,864.5a51,51,0,1,1,51-51A51,51,0,0,1,224,864.5Z"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconPalette;
