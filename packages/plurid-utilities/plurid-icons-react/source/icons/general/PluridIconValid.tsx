import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconValid: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M500.57,39C246.27,38.65,38.59,246.4,39,500.68,39.48,755.14,245.89,961.1,500.37,961c254.72-.1,460.56-206,460.6-460.73C961,245.79,755,39.36,500.57,39ZM775.81,377.67l-313.95,314a49.06,49.06,0,0,1-69.34,0L224.19,523.3a49,49,0,0,1,0-69.3h0a49,49,0,0,1,69.29,0L427.19,587.7,706.52,308.37a49,49,0,0,1,69.29,0h0A49,49,0,0,1,775.81,377.67Z" />
            </svg>
        </PluridIcon>
    );
}


export default PluridIconValid;
