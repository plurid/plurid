import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconGallery: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M878,81a40,40,0,0,1,40,40V671H82V121a40,40,0,0,1,40-40H878m0-60H122A100,100,0,0,0,22,121V731H978V121A100,100,0,0,0,878,21Z"/>
                <path d="M624,827.5V910H376V827.5H624m60-60H316V970H684V767.5Z"/>
                <path d="M918.25,827.5V910h-82.5V827.5h82.5m60-60H775.75V970h202.5V767.5Z"/>
                <path d="M164.25,827.5V910H81.75V827.5h82.5m60-60H21.75V970h202.5V767.5Z"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconGallery;
