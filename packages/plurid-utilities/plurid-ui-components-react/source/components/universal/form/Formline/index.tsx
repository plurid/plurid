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
        StyledFormline,
        StyledFormlineText,
        StyledFormlineElement,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface FormlineProperties {
    text: string;

    Element?: React.FC;
    theme?: Theme;
    level?: number;
    responsive?: boolean;

    style?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode;
}

/**
 * Renders a descriptive text and a form element side by side.
 *
 * The form element can be passed as `Element` prop or as child.
 *
 * @param properties
 */
const Formline: React.FC<FormlineProperties> = (
    properties,
) => {
    // #region properties
    const {
        /** required */
        text,

        /** optional */
        Element,
        theme,
        level,
        responsive,

        style,
        className,

        /** default */
        children,
    } = properties;

    const _theme = theme || pluridTheme;

    const _level = level === undefined
        ? 0
        : level;

    const _responsive = responsive === undefined
        ? false
        : responsive;
    // #endregion properties


    // #region render
    return (
        <StyledFormline
            style={{
                ...style,
            }}
            className={className}
            theme={_theme}
            level={_level}
            responsive={_responsive}
        >
            <StyledFormlineText>
                {text}
            </StyledFormlineText>

            <StyledFormlineElement
                responsive={_responsive}
            >
                {Element
                ? (
                    <Element />
                ) : (
                    <>
                        {children}
                    </>
                )}
            </StyledFormlineElement>
        </StyledFormline>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default Formline;
// #endregion exports
