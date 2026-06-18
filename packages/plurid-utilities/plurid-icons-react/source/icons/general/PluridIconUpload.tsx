import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconUpload: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M493.79,309,732.38,614.2H721.15c-48.9.12-97.8.51-146.7.15-9.33-.08-11,3.11-11,11.58q.42,145,.22,289.9V930.2H430.13v-9.57c0-98.39-.17-196.78.21-295.18,0-9.33-2.85-11.05-11.37-11-49.78.38-99.57.21-149.35.23H259.25Z" />
                <path d="M493.79,309,732.38,614.2H721.15c-48.9.12-97.8.51-146.7.15-9.33-.08-11,3.11-11,11.58q.42,145,.22,289.9V930.2H430.13v-9.57c0-98.39-.17-196.78.21-295.18,0-9.33-2.85-11.05-11.37-11-49.78.38-99.57.21-149.35.23H259.25Z" />
                <polygon points="948.5 382.12 948.5 69.8 51.92 69.8 51.5 382.12 166.5 382.12 166.5 184.12 838.5 184.12 838.5 382.12 948.5 382.12" />
                <polygon points="948.5 382.12 948.5 69.8 51.92 69.8 51.5 382.12 166.5 382.12 166.5 184.12 838.5 184.12 838.5 382.12 948.5 382.12" />
            </svg>
        </PluridIcon>
    );
}


export default PluridIconUpload;
