import React, {
    useContext,
} from 'react';

import {
    StyledPluridRoot,
} from './styled';

import Context from '../../../App/View/context';

import PluridPlane from '../PluridPlane';



interface PluridRootProperties {
    page: any;
}

const PluridRoot: React.FC<PluridRootProperties> = (properties) => {
    const context: any = useContext(Context);

    const {
        page,
    } = properties;

    const {
        pages,
    } = context;

    const _page = pages.find((_page: any) => _page.path === page.path);
    // console.log(page);

    if (_page) {
        const Page = _page.component.element;
        return (
            <StyledPluridRoot>
                <PluridPlane
                    page={_page}
                    planeId={page.planeId}
                >
                    <Page />
                </PluridPlane>
            </StyledPluridRoot>
        );
    }

    return (
        <div></div>
    );
}


export default PluridRoot;
