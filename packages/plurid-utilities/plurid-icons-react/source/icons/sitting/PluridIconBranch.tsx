import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconBranch: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M868,589.5a132,132,0,0,0-128.57,102H616c-19.59,0-22.21-3.83-25-7.89-7.54-11-14.08-35.2-23.14-68.7-8.64-32-20.49-75.8-39.51-131.16-13.89-40.43-24.28-73.76-32.63-100.54-10-32-17.4-55.8-25.31-74.21H739.55a132,132,0,1,0-.24-60H393c-4.33-.33-8.95-.5-13.95-.5v.5H260.69a132,132,0,1,0-.24,60h130c11.75,1.23,14.12,4.58,17,8.6,9.09,12.89,17.84,41,31.09,83.47,8.46,27.15,19,60.93,33.17,102.18C490,556.7,501.07,597.66,510,630.57c11,40.66,18.26,67.52,31.54,86.93,20.62,30.14,50.65,34,74.5,34H739.43A132,132,0,1,0,868,589.5Z"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconBranch;
