import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconRunning: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M500.57,39C246.27,38.65,38.59,246.4,39,500.68,39.48,755.14,245.89,961.1,500.37,961c254.72-.1,460.56-206,460.6-460.73C961,245.79,755,39.36,500.57,39ZM169.82,743.83l59.46-59.46A327.59,327.59,0,0,1,667.43,218.45l11,6.58-57.36,57.35-6.5-3.38c-6.76-3.53-13.8-6.78-20.92-9.67A249,249,0,0,0,286.17,627.48l55.23-55.24V743.83ZM826.67,523.26a327.62,327.62,0,0,1-497.1,256.48l-10.84-6.62L375.89,716l6.55,3.51A248.92,248.92,0,0,0,744.75,545.9a247.07,247.07,0,0,0-32.68-176.27l-55.8,55.8V253.85H827.85l-59,59A327.55,327.55,0,0,1,826.67,523.26Z" />
            </svg>
        </PluridIcon>
    );
}


export default PluridIconRunning;
