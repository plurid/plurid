import React from 'react';

import {
    StyledPagesView,
} from './styled';

import PluridSpace from '../../components/PluridSpace';



interface PagesViewProperties {
}

const PagesView: React.FC<PagesViewProperties> = (properties) => {
    return (
        <StyledPagesView>
            <PluridSpace />
        </StyledPagesView>
    );
}


export default PagesView;
