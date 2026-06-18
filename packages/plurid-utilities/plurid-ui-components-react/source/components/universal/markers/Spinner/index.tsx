// #region imports
    // #region libraries
    import React from 'react';

    import {
        StyledSpinner,
        StyledLoader
    } from './styled';

    import {
        plurid as pluridTheme,
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        Sizes,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export interface SpinnerProperties {
    // #region optional
        // #region values
        theme?: Theme;
        size?: Sizes;
        style?: React.CSSProperties;
        className?: string;
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion optional

}

const Spinner: React.FC<SpinnerProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region optional
            // #region values
            theme,
            size,
            style,
            className,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion optional

    } = properties;

    const themeValue = theme || pluridTheme;
    const sizeValue = size || 'normal';
    // #endregion properties


    // #region render
    return (
        <StyledSpinner
            style={{
                ...style,
            }}
            className={className}
        >
            <StyledLoader
                theme={themeValue}
                size={sizeValue}
            >
                <div />
                <div />
                <div />
                <div />
            </StyledLoader>
        </StyledSpinner>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default Spinner;
// #endregion exports
