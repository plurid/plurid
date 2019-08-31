import React from 'react';

import {
    StyledPluridSpace,
} from './styled';

import {
    PluridPage,
} from '../../data/interfaces';

import PluridPlane from '../PluridPlane';



interface PluridSpaceProperties {
    pages: PluridPage[];
}

const PluridSpace: React.FC<PluridSpaceProperties> = (properties) => {
    const {
        pages,
    } = properties;

    return (
        <StyledPluridSpace>
            {pages.map(page => {
                const Page = page.component.element;
                return (
                    <PluridPlane
                        key={page.path}
                        page={page}
                    >
                        <Page />
                    </PluridPlane>
                );
            })}
        </StyledPluridSpace>
    );
}


export default PluridSpace;
