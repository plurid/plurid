// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        SIZES,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledPluridRoots {}

export const StyledPluridRoots = styled.div<IStyledPluridRoots>`
    transform-style: preserve-3d;
    transform-origin: 0 0 0;
`;


export interface IStyledTransformOrigin {
    theme: Theme;
    transformOriginSize: keyof typeof SIZES;
}

export const StyledTransformOrigin = styled.div<IStyledTransformOrigin>`
    background-color: ${({theme}) => theme.backgroundColorTertiaryAlpha};
    height: ${({
        transformOriginSize,
    }) => {
        switch (transformOriginSize) {
            case SIZES.SMALL:
                return '5px';
            case SIZES.NORMAL:
                return '10px';
            case SIZES.LARGE:
                return '15px';
            default:
                return '10px';
        }
    }};
    width: ${({
        transformOriginSize,
    }) => {
        switch (transformOriginSize) {
            case SIZES.SMALL:
                return '5px';
            case SIZES.NORMAL:
                return '10px';
            case SIZES.LARGE:
                return '15px';
            default:
                return '10px';
        }
    }};

    position: absolute;
    z-index: 999;
    border-radius: 100px;
    user-select: none;
    pointer-events: none;
    touch-action: none;
`;
// #endregion module
