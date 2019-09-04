import React, {
    useContext,
} from 'react';

import {
    StyledPluridRoot,
} from './styled';

import Context from '../../../App/View/context';

import PluridPlane from '../PluridPlane';

import { TreePage } from '../../services/state/types/space';

import {
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
