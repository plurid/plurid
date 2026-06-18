import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconAdd: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M858,433.5H561v-297A66.5,66.5,0,0,0,494.5,70h0A66.5,66.5,0,0,0,428,136.5v297H131A66.5,66.5,0,0,0,64.5,500h0A66.5,66.5,0,0,0,131,566.5H428v297A66.5,66.5,0,0,0,494.5,930h0A66.5,66.5,0,0,0,561,863.5v-297H858A66.5,66.5,0,0,0,924.5,500h0A66.5,66.5,0,0,0,858,433.5Z"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconAdd;
