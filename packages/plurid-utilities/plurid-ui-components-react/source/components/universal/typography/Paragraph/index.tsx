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
        StyledParagraph,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface ParagraphProperties {
    // #region optional
        // #region values
        theme?: Theme;
        size?: 'small' | 'normal' | 'large';
        fontFamily?: 'sans-serif' | 'serif';
        style?: React.CSSProperties;
        className?: string;
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion optional
}

const Paragraph: React.FC<React.PropsWithChildren<ParagraphProperties>> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            children,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion required

        // #region optional
            // #region values
            theme: themeProperty,
            size: sizeProperty,
            fontFamily: fontFamilyProperty,

            style,
            className,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion optional
    } = properties;

    const theme = themeProperty || pluridTheme;
    const size = sizeProperty  || 'normal';
    const fontFamily = fontFamilyProperty || 'sans-serif';
    // #endregion properties


    // #region render
    return (
        <StyledParagraph
            theme={theme}
            size={size}
            fontFamily={fontFamily}
            style={{
                ...style,
            }}
            className={className}
        >
            {children}
        </StyledParagraph>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default Paragraph;
// #endregion exports
