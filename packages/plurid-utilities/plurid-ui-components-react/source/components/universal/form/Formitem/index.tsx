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
        StyledFormitem,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface FormitemProperties {
    theme?: Theme;
    level?: number;

    style?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode;
}

/**
 * Renders a form item.
 *
 * @param properties
 */
const Formitem: React.FC<FormitemProperties> = (
    properties,
) => {
    // #region properties
    const {
        /** optional */
        theme,
        level,
        style,
        className,

        /** default */
        children,
    } = properties;

    const _theme = theme || pluridTheme;
    const _level = level ?? 0;
    // #endregion properties


    // #region render
    return (
        <StyledFormitem
            style={{
                ...style,
            }}
            className={className}
            theme={_theme}
            level={_level}
        >
            {children}
        </StyledFormitem>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default Formitem;
// #endregion exports
