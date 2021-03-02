import React from 'react';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    StyledButtonInline,
} from './styled';



export interface ButtonInlineProps {
    theme: Theme;
    atClick?: any;
    styles?: any;
}

const ButtonInline: React.FC<ButtonInlineProps> = (
    properties,
) => {
    /** properties */
    const {
        atClick,
        theme,
        styles,
        children,
    } = properties;


    /** render */
    return (
        <StyledButtonInline
            theme={theme}
            onClick={atClick
                ? atClick
                : undefined
            }
            style={styles
                ? {...styles}
                : {}
            }
        >
            {children}
        </StyledButtonInline>
    );
}


export default ButtonInline;
