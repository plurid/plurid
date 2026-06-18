import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconWarning: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M500.57,39C246.27,38.65,38.59,246.4,39,500.68,39.48,755.14,245.89,961.1,500.37,961c254.72-.1,460.56-206,460.6-460.73C961,245.79,755,39.36,500.57,39ZM550,776.75a50,50,0,0,1-50,50h0a50,50,0,0,1-50-50v-50H550ZM550,642H450V223.25a50,50,0,0,1,50-50h0a50,50,0,0,1,50,50Z" />
            </svg>
        </PluridIcon>
    );
}


export default PluridIconWarning;
