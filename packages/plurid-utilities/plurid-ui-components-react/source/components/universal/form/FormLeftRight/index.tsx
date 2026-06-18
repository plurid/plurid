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
        StyledFormLeftRight,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface FormLeftRightProperties {
    theme?: Theme;
    style?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode;
}

/**
 * Form left and right items
 *
 * @param properties
 */
const FormLeftRight: React.FC<FormLeftRightProperties> = (
    properties,
) => {
    // #region properties
    const {
        /** optional */
        theme,
        style,
        className,

        /** default */
        children,
    } = properties;

    const _theme = theme || pluridTheme;
    // #endregion properties


    // #region render
    return (
        <StyledFormLeftRight
            style={{
                ...style,
            }}
            className={className}
            theme={_theme}
        >
            {children}
        </StyledFormLeftRight>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default FormLeftRight;
// #endregion exports
