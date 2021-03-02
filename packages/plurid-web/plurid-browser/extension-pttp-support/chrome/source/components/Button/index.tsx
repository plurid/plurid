import React from 'react';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    StyledButton,
} from './styled';



export interface ButtonProperties {
    theme: Theme;
    text: string;
    atClick: any;
    loading?: boolean;
    loadingText?: string;
}

const Button: React.FC<ButtonProperties> = (
    properties,
) => {
    /** properties */
    const {
        theme,
        text,
        atClick,
        loading,
        loadingText,
    } = properties;


    /** handle */
    const handleClick = () => {
        atClick();
    }


    /** render */
    return (
        <StyledButton
            theme={theme}
        >
           <button
                onClick={handleClick}
                disabled={loading}
           >
               {loading ? loadingText : text}
           </button>
        </StyledButton>
    );
}


export default Button;
