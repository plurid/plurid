import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconClassConstructor: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M599.41,146.48c221.82-128.06,354,2.57,295.33,291.77L91.33,902.7C150.18,612.82,377.59,274.55,599.41,146.48Zm52.26,201.78c15.37-75.72-19.25-109.92-77.32-76.39S456.72,394,441.35,469.69s19.25,109.92,77.33,76.39S636.3,424,651.67,348.26"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconClassConstructor;
