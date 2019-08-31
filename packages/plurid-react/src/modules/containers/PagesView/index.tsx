import React from 'react';

import {
    StyledPagesView,
} from './styled';

import {
    PluridPage,
} from '../../data/interfaces';

import PluridSpace from '../../components/PluridSpace';



interface PagesViewProperties {
    pages: PluridPage[];
}

const PagesView: React.FC<PagesViewProperties> = (properties) => {
    const {
        pages,
    } = properties;

    return (
        <StyledPagesView>
            <PluridSpace
                pages={pages}
            />
        </StyledPagesView>
    );
}


export default PagesView;
