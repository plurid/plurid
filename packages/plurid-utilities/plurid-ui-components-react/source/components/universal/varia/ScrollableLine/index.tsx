// #region imports
    // #region libraries
    import React from 'react';
    // #endregion libraries

    // #region internal
    import {
        StyledScrollableLine,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface ScrollableLineProperties {
    // #region required
        // #region values
        text: string;
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion required

    // #region optional
        // #region values
        style?: React.CSSProperties;
        className?: string;
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion optional
}

/**
 * Renders a horizontal scrollable line of text
 * based on the width of the container.
 *
 * @param properties
 */
const ScrollableLine: React.FC<ScrollableLineProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            text,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion required

        // #region optional
            // #region values
            style,
            className,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion optional
    } = properties;
    // #endregion properties


    // #region render
    return (
        <StyledScrollableLine
            style={{
                ...style,
            }}
            className={className}
        >
            {text}
        </StyledScrollableLine>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default ScrollableLine;
// #endregion exports
