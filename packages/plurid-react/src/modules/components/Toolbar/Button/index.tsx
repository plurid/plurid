import React, { useState } from 'react';

import {
    StyledToolbarButton,
    StyledToolbarButtonText,
} from './styled';



interface ToolbarButtonProps {
    atClick: any;
    image: any;
    scaleImage?: boolean;
    text: any;
    textLeft?: boolean;
    showText?: boolean;
    first?: boolean;
    last?: boolean;
    active?: boolean;
    theme?: any;
}


const ToolbarButton: React.FC<ToolbarButtonProps> = (props) => {
    const [mouseOver, setMouseOver] = useState(false);

    const {
        atClick,
        image,
        scaleImage,
        text,
        textLeft,
        showText,
        first,
        last,
        active,
        theme,
    } = props;

    return (
        <StyledToolbarButton
            onMouseEnter={() => setMouseOver(true)}
            onMouseLeave={() => setMouseOver(false)}
            onClick={atClick}
            first={first}
            last={last}
            active={active}
            theme={theme}
            scaleImage={scaleImage}
        >
            {image}

            {mouseOver && showText && (
                <StyledToolbarButtonText
                    textLeft={textLeft}
                >
                    {text}
                </StyledToolbarButtonText>
            )}
        </StyledToolbarButton>
    );
}


export default ToolbarButton;
