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

    if (_page) {
        const Page = _page.component.element;
        return (
            <StyledPluridRoot>
                <PluridPlane
                    page={_page}
                    planeID={page.planeID}
                    location={location}
                >
                    <Page />
                </PluridPlane>

                {page.children && page.children.map(child => {
                    // TODO: render the children and the children of the children

                    const _page = pages.find((_page: any) => _page.path === child.path);

                    if (_page) {
                        const Page = _page.component.element;
                        return (
                            <PluridPlane
                                key={child.planeID}
                                page={_page}
                                planeID={child.planeID}
                                location={child.location}
                            >
                                <Page />
                            </PluridPlane>
                        );
                    }

                    return (
                        <div></div>
                    );
                })}
            </StyledPluridRoot>
        );
    }

    return (
        <div></div>
    );
}


export default PluridRoot;
