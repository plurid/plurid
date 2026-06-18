import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconGlobal: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <g>
                    <path d="M537.35,500.36,466,500.1c0-116.88.08-234.87.13-352.85l-3.09-.91L353.44,256,304.36,206.9,499.6,11.66,695.13,207.19,647,255.37,537.35,145.78Z"/>
                    <path d="M465.85,499.64l71.32.26c0,116.88-.08,234.87-.13,352.85l3.09.91L649.76,744l49.08,49.08L503.6,988.34,308.08,792.81l48.18-48.18L465.85,854.22Z"/>
                </g>
                <g>
                    <path d="M499.64,529.71c.09-26.35.18-48.7.26-71.32l352.85.12.91-3.08L744,345.8l49.08-49.08L988.34,492,792.81,687.48,744.63,639.3,854.22,529.7Z"/>
                    <path d="M500.36,458.21c-.09,26.34-.18,48.69-.26,71.31l-352.85-.12-.91,3.08L256,642.11,206.9,691.19,11.66,496,207.19,300.43l48.18,48.18L145.78,458.21Z"/>
                </g>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconGlobal;
