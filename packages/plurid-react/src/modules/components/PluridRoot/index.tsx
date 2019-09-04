import React, {
    useContext,
} from 'react';

import {
    StyledPluridRoot,
} from './styled';

import Context from '../../../App/View/context';

import PluridPlane from '../PluridPlane';

import {
    TreePage,
    PluridAppContext,
} from '../../data/interfaces';



interface PluridRootProperties {
    page: TreePage;
}

const PluridRoot: React.FC<PluridRootProperties> = (properties) => {
    const context: PluridAppContext = useContext(Context);

    const {
        page,
    } = properties;

    const {
        pages,
    } = context;

    const {
        location,
    } = page;

    const _page = pages.find((_page: any) => _page.path === page.path);
    // console.log(page);

    if (_page) {
        const Page = _page.component.element;
        return (
            <StyledPluridRoot
                style={{
                    transform: `
                        translateX(${location.translateX}px)
                        translateY(${location.translateY}px)
                        translateZ(${location.translateZ}px)
                        rotateX(${location.rotateX}deg)
                        rotateY(${location.rotateY}deg)
                    `,
                }}
            >
                <PluridPlane
                    page={_page}
                    planeID={page.planeID}
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
