import React, {
    useContext,
} from 'react';

import {
    StyledPluridRoots,
} from './styled';

import Context from '../../../App/View/context';

// import {
//     PluridPage,
// } from '../../data/interfaces';

import PluridPlane from '../PluridPlane';



interface PluridRootsProperties {
}

const PluridRoots: React.FC<PluridRootsProperties> = (properties) => {
    const context: any = useContext(Context);

    console.log(context);

    const {
    } = properties;

    const {
        pages,
    } = context;

    return (
        <StyledPluridRoots>
            {pages.map((page: any) => {
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
        </StyledPluridRoots>
    );
}


export default PluridRoots;
