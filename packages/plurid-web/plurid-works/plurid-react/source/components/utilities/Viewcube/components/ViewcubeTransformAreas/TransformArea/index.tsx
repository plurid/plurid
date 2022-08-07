// #region imports
    // #region libraries
    import React from 'react';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region internal
    import {
        StyledTransformArea,
        StyledTransformLine,
        StyledTransformThumb,
    } from './styled';

    import {
        TransformAreaPosition,
    } from './data';
    // #endregion internal
// #region imports



// #region module
export interface TransformAreaProperties {
    // #region required
        // #region values
        theme: Theme;
        value: number;
        // #endregion values

        // #region methods
        atChange: (value: number) => void;
        // #endregion methods
    // #endregion required

    // #region optional
        // #region values
        position?: TransformAreaPosition;
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
            value,
            // #endregion values

            // #region methods
            atChange,
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

            <StyledTransformThumb
                theme={theme}
                value={value}
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
