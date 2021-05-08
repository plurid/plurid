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
    // #region required
        // #region values
        image: any;
        text: any;
        // #endregion values

        // #region methods
        atClick: any;
        // #endregion methods
    // #endregion required

    // #region optional
        // #region values
        scaleImage?: boolean;
        textLeft?: boolean;
        showText?: boolean;
        first?: boolean;
        last?: boolean;
        active?: boolean;
        theme?: any;
        // #endregion values
    // #endregion optional
}

const PluridToolbarButton: React.FC<PluridToolbarButtonProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            image,
            text,
            // #endregion values

            // #region methods
            atClick,
            // #endregion methods
        // #endregion required

        // #region optional
            // #region values
            scaleImage,
            textLeft,
            showText,
            first,
            last,
            active,
            theme,
            // #endregion values
        // #endregion optional
    } = properties;
    // #endregion properties


    // #region state
    const [
        mouseOver,
        setMouseOver,
    ] = useState(false);
    // #endregion statet


    // #region render
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
    // #endregion render
}
// #endregion module



// #region exports
export default PluridToolbarButton;
// #endregion exports
