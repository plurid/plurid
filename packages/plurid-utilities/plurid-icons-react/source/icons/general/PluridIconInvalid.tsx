import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconInvalid: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M500.57,39C246.27,38.65,38.59,246.4,39,500.68,39.48,755.14,245.89,961.1,500.37,961c254.72-.1,460.56-206,460.6-460.73C961,245.79,755,39.36,500.57,39Zm215.8,606.66a49,49,0,0,1,0,69.3L715,716.37a49,49,0,0,1-69.3,0L500,570.71,354.34,716.37a49,49,0,0,1-69.3,0L283.63,715a49,49,0,0,1,0-69.3L429.29,500,283.63,354.34a49,49,0,0,1,0-69.3l1.41-1.41a49,49,0,0,1,69.3,0L500,429.29,645.66,283.63a49,49,0,0,1,69.3,0l1.41,1.41a49,49,0,0,1,0,69.3L570.71,500Z" />
            </svg>
        </PluridIcon>
    );
}


export default PluridIconInvalid;
