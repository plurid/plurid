// #region imports
    // #region libraries
    import React, {
        useState,
    } from 'react';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region internal
    import {
        StyledVerticalToolbarButton,
        StyledVerticalToolbarButtonText,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface VerticalToolbarButtonOwnProperties {
    atClick: (event: React.MouseEvent) => void;
    icon: React.FC;
    active: boolean;
    text: string;
    textLeft: boolean;
    showText: boolean;
    scaleIcon: boolean;
    theme: Theme;
    first?: boolean;
    last?: boolean;
}

const VerticalToolbarButton: React.FC<VerticalToolbarButtonOwnProperties> = (
    properties,
) => {
    // #region properties
    const {
        atClick,
        icon: Icon,
        active,
        text,
        textLeft,
        showText,
        scaleIcon,
        first,
        last,
        theme,
    } = properties;
    // #endregion properties


    // #region state
    const [mouseOver, setMouseOver] = useState(false);
    // #endregion state


    // #region render
    return (
        <StyledVerticalToolbarButton
            onMouseEnter={() => setMouseOver(true)}
            onMouseLeave={() => setMouseOver(false)}
            onClick={atClick}
            active={active}
            scaleIcon={scaleIcon}
            first={first}
            last={last}
            theme={theme}
        >
            <Icon />

            {mouseOver
            && showText
            && (
                <StyledVerticalToolbarButtonText
                    textLeft={textLeft}
                >
                    {text}
                </StyledVerticalToolbarButtonText>
            )}
        </StyledVerticalToolbarButton>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default VerticalToolbarButton;
// #endregion exports
