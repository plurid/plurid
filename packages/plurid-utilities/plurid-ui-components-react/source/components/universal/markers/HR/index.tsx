// #region imports
    // #region libraries
    import React from 'react';

    import {
        plurid as pluridTheme,
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region internal
    import {
        StyledHR,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface HRProperties {
    // #region optional
        // #region values
        theme?: Theme;
        style?: React.CSSProperties;
        className?: string;
        // #endregion values
    // #endregion optional
}

const HR: React.FC<HRProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region optional
            // #region values
            theme,
            style,
            className,
            // #endregion values
        // #endregion optional
    } = properties;

    const themeValue = theme || pluridTheme;
    // #endregion properties


    // #region render
    return (
        <StyledHR
            theme={themeValue}
            style={{
                ...style,
            }}
            className={className}
        />
    );
    // #endregion render
}
// #endregion module



// #region exports
export default HR;
// #endregion exports
