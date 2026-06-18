import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconClassProtectedMethod: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <polygon points="395.21 461.65 475.92 809.84 157.24 888.05 395.21 461.65"/>
                <polygon points="486.47 40.63 632.37 670.04 530.7 694.99 436.5 288.61 158.76 786.27 56.3 811.41 486.47 40.63"/>
                <path d="M815.2,583.29a16.6,16.6,0,0,1,3.83-1.65c40.15-10.15,80.25-20,120.4-30.16,3.31-.83,4.05.42,4.06,4.1,0,29.25.09,58.36.18,87.5-.2,28.66.36,56.9-.3,85.8-.22,9.71-2.69,21-5.56,31.75C917.4,837.35,877.72,900.31,819,948.52a22.46,22.46,0,0,1-3.07,2.12c-4.28,2.47-8.95,3.42-13.16,4.47-60.86,15.06-97.87-10.08-113.64-70.82A39.17,39.17,0,0,1,688,874.7c-.23-57.28-.34-114.63-.62-171.88,0-3.69,1.08-5.58,4-8.25q59.91-54.09,119.77-108.35A24.27,24.27,0,0,1,815.2,583.29Z"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconClassProtectedMethod;
