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
        StyledHeading1,
        StyledHeading2,
        StyledHeading3,
        StyledHeading4,
        StyledHeading5,
        StyledHeading6,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface HeadingProperties {
    // #region optional
        // #region values
        theme?: Theme;
        type?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        style?: React.CSSProperties;
        className?: string;
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion optional
}

const Heading: React.FC<React.PropsWithChildren<HeadingProperties>> = (
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
            type: typeProperty,
            style,
            className,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion optional
    } = properties;

    const theme = themeProperty || pluridTheme;
    const type = typeProperty || 'h1';
    // #endregion properties


    // #region render
    const renderProperties = {
        theme,
        style,
        className,
    };

    switch (type) {
        case 'h1':
            return (
                <StyledHeading1
                    {...renderProperties}
                >
                    {children}
                </StyledHeading1>
            );
        case 'h2':
            return (
                <StyledHeading2
                    {...renderProperties}
                >
                    {children}
                </StyledHeading2>
            );
        case 'h3':
            return (
                <StyledHeading3
                    {...renderProperties}
                >
                    {children}
                </StyledHeading3>
            );
        case 'h4':
            return (
                <StyledHeading4
                    {...renderProperties}
                >
                    {children}
                </StyledHeading4>
            );
        case 'h5':
            return (
                <StyledHeading5
                    {...renderProperties}
                >
                    {children}
                </StyledHeading5>
            );
        case 'h6':
            return (
                <StyledHeading6
                    {...renderProperties}
                >
                    {children}
                </StyledHeading6>
            );
        default:
            return (
                <StyledHeading1
                    {...renderProperties}
                >
                    {children}
                </StyledHeading1>
            );
    }
    // #endregion render
}
// #endregion module



// #region exports
export default Heading;
// #endregion exports
