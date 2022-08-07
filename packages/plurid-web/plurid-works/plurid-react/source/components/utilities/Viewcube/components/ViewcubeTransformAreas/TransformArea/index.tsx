// #region imports
    // #region libraries
    import React from 'react';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    // #endregion external


    // #region internal
    import {
        StyledTransformArea,
        StyledTransformLine,
    } from './styled';
    // #endregion internal
// #region imports



// #region module
export interface TransformAreaProperties {
    // #region required
        // #region values
        theme: Theme;
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion required

    // #region optional
        // #region values
        position?: 'vertical' | 'horizontal';
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion optional
}

const TransformArea: React.FC<TransformAreaProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            theme,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion required

        // #region optional
            // #region values
            position: positionProperty,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion optional
    } = properties;

    const position = positionProperty || 'horizontal';
    // #endregion properties


    // #region render
    return (
        <StyledTransformArea
            theme={theme}
        >
            <StyledTransformLine
                theme={theme}
                position={position}
            />
        </StyledTransformArea>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default TransformArea;
// #endregion exports
