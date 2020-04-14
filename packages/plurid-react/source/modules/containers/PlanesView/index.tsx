import React from 'react';

import {
    StyledPlanesView,
} from './styled';

import PluridSpace from '../../components/PluridSpace';



interface PlanesViewProperties {
}

const PlanesView: React.FC<PlanesViewProperties> = () => {
    return (
        <StyledPlanesView>
            <PluridSpace />
        </StyledPlanesView>
    );
}


export default PlanesView;
