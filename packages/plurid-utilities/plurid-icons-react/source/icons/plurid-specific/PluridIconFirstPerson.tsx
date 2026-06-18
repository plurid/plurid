import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconFirstPerson: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M542.85,69,982.5,298C884.39,477.18,787.09,654.88,688.94,834.16c-46.29-15.34-91.21-29.78-135.64-45.59-4.9-1.75-9.17-11.06-9.95-17.33-1.56-12.51-.5-25.34-.5-38V69Z"/>
                <path d="M457,68.82v30c0,218.79-.33,437.59.54,656.38.08,20.53-5.6,29.77-25.38,35.06-34.86,9.31-68.77,22.14-103.57,31.69-6.93,1.9-20.58-1.79-23.57-7.13-96-171.63-191.07-343.77-287.48-518Z"/>
                <path d="M386.38,893.24c35.43-11.29,70.76-22.91,106.38-33.54,6.16-1.84,14-.85,20.33,1.16,33.82,10.73,67.4,22.19,102.22,38.54-38.19,11.44-76.43,31.93-114.58,31.78s-76.21-20.94-114.32-32.68Z"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconFirstPerson;
