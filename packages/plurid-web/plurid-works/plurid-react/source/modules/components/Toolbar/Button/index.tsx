// #region imports
    // #region libraries
    import React, {
        useState,
    } from 'react';
    // #endregion libraries


    // #region internal
    import {
        StyledToolbarButton,
        StyledToolbarButtonText,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridToolbarButtonProperties {
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

const PluridToolbarButton: React.FC<PluridToolbarButtonProperties> = (
    properties,
) => {
    /** properties */
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
    } = properties;


    /** state */
    const [mouseOver, setMouseOver] = useState(false);


    /** render */
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
// #endregion module



// #region exports
export default PluridToolbarButton;
// #endregion exports
