import React from 'react';

import {
    StyledErrorPage,
} from './styled';



interface ErrorPageProperties {
    error: string;
}

const ErrorPage: React.FC<ErrorPageProperties> = (properties) => {
    const {
        error,
    } = properties;

    return (
        <StyledErrorPage>
            {error}
        </StyledErrorPage>
    );
}


export default ErrorPage;
