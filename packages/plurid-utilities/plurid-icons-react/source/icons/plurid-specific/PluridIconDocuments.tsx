import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconDocuments: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M223.21-.5H628.34V253.4H884.11V907.17H223.21ZM785.56,400.41H320c.61,11.38,1.11,42.24,1.67,52.63H785.56Zm-463.94,218H787.34c-.76-12-1.3-41.78-1.89-51.19H321.62Zm0,146.86h465.3c-.51-11.54-.92-42.17-1.36-52.13H321.58Z"/>
                <path d="M115.89,107.84h39.68v850.7H763.73v42H115.89Z"/>
                <path d="M673.89,207.47V28.38l178,179.09Z"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconDocuments;
