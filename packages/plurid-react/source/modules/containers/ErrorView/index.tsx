import React from 'react';

import {
    StyledErrorView,
} from './styled';



export interface PluridErrorViewProperties {
    error: string;
}

const PluridErrorView: React.FC<PluridErrorViewProperties> = (
    properties,
) => {
    const {
        error,
    } = properties;

    return (
        <StyledErrorView>
            {error}
        </StyledErrorView>
    );
}


export default PluridErrorView;
