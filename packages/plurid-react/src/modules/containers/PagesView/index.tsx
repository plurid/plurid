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

            {pages.map(page => {
                const Element = page.component.element;
                return (
                    <Element
                        key={page.path}
                    />
                );
            })}
        </StyledPagesView>
    );
}


export default PagesView;
