// #region imports
    // #region libraries
    import React from 'react';

    import themes, {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region internal
    import {
        StyledHorizontalToolbarButton,
        StyledHorizontalToolbarButtonIcon,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface HorizontalToolbarButtonOwnProperties {
    // #region required
        // #region values
        text: string;
        // #endregion values

        // #region methods
        atClick: (
            event: React.MouseEvent,
        ) => void;
        // #endregion methods
    // #endregion required

    // #region optional
        // #region values
        active?: boolean;
        icon?: React.FC;
        scaleIcon?: boolean;
        theme?: Theme;
        style?: React.CSSProperties;
        className?: string;
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion optional
}

const HorizontalToolbarButton: React.FC<HorizontalToolbarButtonOwnProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            text,
            // #endregion values

            // #region methods
            atClick,
            // #endregion methods
        // #endregion required

        // #region optional
            // #region values
            active,
            scaleIcon,
            icon: Icon,
            theme: themeProperty,
            style,
            className,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion optional
    } = properties;

    const theme = themeProperty || themes.plurid;
    // #endregion properties


    // #region render
    return (
        <StyledHorizontalToolbarButton
            active={active}
            scaleIcon={scaleIcon}
            onClick={atClick}
            theme={theme}
            style={{
                ...style,
            }}
            className={className}
        >
            {Icon && (
                <StyledHorizontalToolbarButtonIcon
                    text={text}
                >
                    <Icon />
                </StyledHorizontalToolbarButtonIcon>
            )}

            {text}
        </StyledHorizontalToolbarButton>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default HorizontalToolbarButton;
// #endregion exports
