import React from 'react';

import {
    StyledPagesView,
} from './styled';

import {
    PluridPage,
} from '../../data/interfaces';



interface PagesViewProperties {
    pages: PluridPage[];
}

const PagesView: React.FC<PagesViewProperties> = (properties) => {
    const {
        pages,
    } = properties;

    console.log(pages);

    return (
        <StyledPagesView>
            pages view
        </StyledPagesView>
    );
}


export default PagesView;
