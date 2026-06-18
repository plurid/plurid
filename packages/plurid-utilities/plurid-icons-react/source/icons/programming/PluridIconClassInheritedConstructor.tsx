import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconClassInheritedConstructor: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M547.41,84.35c221.82-128.07,354,2.55,295.33,291.76L39.32,840.56C98.18,550.67,325.59,212.41,547.41,84.35Zm52.26,201.77c15.37-75.72-19.24-109.93-77.33-76.39s-117.62,122.1-133,197.82,19.25,109.92,77.33,76.39,117.62-122.1,133-197.82"/>
                <path d="M720.15,376.71c172.52-99.6,275.35,2,229.69,226.91L325,964.84C370.77,739.39,547.63,476.31,720.15,376.71ZM760.8,533.63c12-58.88-15-85.49-60.14-59.41s-91.48,95-103.44,153.85,15,85.49,60.15,59.41,91.47-95,103.43-153.85"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconClassInheritedConstructor;
