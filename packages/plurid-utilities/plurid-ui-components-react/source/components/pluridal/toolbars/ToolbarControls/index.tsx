// #region imports
    // #region libraries
    import React from 'react';

    import {
        plurid as pluridTheme,
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        VerticalPositions,
    } from '~data/enumerations';
    // #endregion external


    // #region internal
    import {
        StyledToolbarControls,
        StyledToolbarControlsButtons,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface ToolbarControlsOwnProperties {
    // #region optional
        // #region values
        position?: keyof typeof VerticalPositions;

        theme?: Theme;
        style?: React.CSSProperties;
        className?: string;
        children?: React.ReactNode;
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion optional
}

export type ToolbarControlsProperties = ToolbarControlsOwnProperties;

const ToolbarControls: React.FC<ToolbarControlsProperties> = (
    properties,
) => {
    // #region optional
    const {
        // #region optional
            // #region values
            position: positionProperty,
            theme: themeProperty,
            style,
            className,

            children,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion optional
    } = properties;

    const position = positionProperty || VerticalPositions.top;
    const theme = themeProperty || pluridTheme;
    // #endregion optional


    // #region render
    return (
        <StyledToolbarControls
            position={position}
            theme={theme}
            style={{
                ...style,
            }}
            className={className}
        >
            <StyledToolbarControlsButtons
                theme={theme}
            >
                {children}
            </StyledToolbarControlsButtons>
        </StyledToolbarControls>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default ToolbarControls;
// #endregion exports
