import React, {
    useContext,
} from 'react';

import {
    StyledPluridRoot,
} from './styled';

import Context from '../../../App/View/context';

import PluridPlane from '../PluridPlane';



interface PluridRootProperties {
    path: string;
}

const PluridRoot: React.FC<PluridRootProperties> = (properties) => {
    const context: any = useContext(Context);

    const {
        path,
    } = properties;

    const {
        pages,
    } = context;

    const page = pages.find((_page: any) => _page.path === path);
    // console.log(page);

    if (page) {
        const Page = page.component.element;
        return (
            <StyledPluridRoot>
                <PluridPlane
                    page={page}
                >
                    <Page />
                </PluridPlane>
            </StyledPluridRoot>
        );
        // return (
        //     <div>
        //         {page.path}
        //     </div>
        // );
    }

    return (
        <div></div>
    );
}


export default PluridRoot;
