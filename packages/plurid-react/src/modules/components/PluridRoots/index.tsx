import React from 'react';

import {
    StyledPluridRoots,
} from './styled';

// import {
//     PluridPage,
// } from '../../data/interfaces';

// import PluridPlane from '../PluridPlane';



interface PluridRootsProperties {
}

const PluridRoots: React.FC<PluridRootsProperties> = (properties) => {
    const {
    } = properties;

    return (
        <StyledPluridRoots>
            {/* {pages.map(page => {
                const Page = page.component.element;
                return (
                    <PluridPlane
                        key={page.path}
                        page={page}
                    >
                        <Page />
                    </PluridPlane>
                );
            })} */}
        </StyledPluridRoots>
    );
}


export default PluridRoots;
