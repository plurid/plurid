import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconVolumeMuted: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M12.34,347.57c40,.19,80,.06,120,.79,11.38.2,20.31-2.7,29.53-9.63q122.87-92.44,246.5-183.88a122.79,122.79,0,0,1,29.13-15.43c9.28-3.54,14.51.85,15.49,10.68.38,3.78.34,7.61.34,11.42q0,335.75,0,671.5c0,2.22,0,4.44,0,6.66-.61,20-8.58,25-26.82,16A122.42,122.42,0,0,1,408,844.06Q282.08,750.9,156.19,657.71a29.71,29.71,0,0,0-16.28-5.56c-42.52-.26-85,.14-127.57.33Z" />
            </svg>
        </PluridIcon>
    );
}


export default PluridIconVolumeMuted;
