import React from 'react';

import {
    StyledErrorView,
} from './styled';



interface ErrorViewProperties {
    error: string;
}

const ErrorView: React.FC<ErrorViewProperties> = (properties) => {
    const {
        error,
    } = properties;

    return (
        <StyledErrorView>
            {error}
        </StyledErrorView>
    );
}


export default ErrorView;
