import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconClassInheritedAccessor: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <polygon points="255.32 616.46 275.55 611.49 522.58 550.87 530.39 548.96 524.56 559.41 324.99 917 260.44 638.57 255.32 616.46"/>
                <polygon points="507.89 43.39 647.68 646.42 550.27 670.33 524.56 559.41 530.39 548.96 522.58 550.87 460.01 280.98 275.55 611.49 255.32 616.46 260.44 638.57 193.91 757.78 95.75 781.87 507.89 43.39"/>
                <polygon points="628.83 745.64 643.04 742.16 816.43 699.61 821.92 698.26 817.83 705.61 677.74 956.61 632.43 761.16 628.83 745.64"/>
                <polygon points="806.13 343.38 904.25 766.67 835.87 783.46 817.83 705.61 821.92 698.26 816.43 699.61 772.52 510.15 643.04 742.16 628.83 745.64 632.43 761.16 585.73 844.84 516.82 861.76 806.13 343.38"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconClassInheritedAccessor;
