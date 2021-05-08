// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes/distribution';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledPluridViewcubeFace {
    theme: Theme;
    mouseOver: boolean;
    opaque: boolean;
    face: string;
}

export const StyledPluridViewcubeFace = styled.div<IStyledPluridViewcubeFace>`
    font-size: 0.6rem;
    position: absolute;
    height: 50px;
    width: 50px;
    pointer-events: none;
    display: grid;
    transform-style: preserve-3d;
    grid-template-areas: "PVFTopLeft         PVFTopCenter         PVFTopRight"
                         "PVFMiddleLeft      PVFMiddleCenter      PVFMiddleRight"
                         "PVFBottomLeft      PVFBottomCenter      PVFBottomRight";
    grid-template-rows: 10px 30px 10px;
    grid-template-columns: 10px 30px 10px;
    box-sizing: content-box;
    transition: all 300ms linear;

    border: 1px solid ${({
        mouseOver,
        theme,
    }) => {
        if (mouseOver) {
            return theme.colorTertiary;
        }
        return theme.backgroundColorSecondary;
    }};
    box-shadow: ${({
        face,
        theme,
    }) => {
        if (face === 'base') {
            return '0px 0px 12px 2px ' + theme.boxShadowPenumbraColor;
        }
        return '';
    }};
    opacity: ${({
        opaque,
        mouseOver,
    }) => {
        if (!opaque) {
            if (mouseOver) {
                return '0.8';
            }
            if (!mouseOver) {
                return '0.4';
            }
        }
        return '1';
    }};
    transform: ${({
        face,
    }) => {
        switch (face) {
            case 'front':
                return 'translateZ(25px) rotateY(0deg)';
            case 'back':
                return 'translateZ(-25px) rotateY(-180deg)';
            case 'left':
                return 'translateX(-25px) rotateY(-90deg)';
            case 'right':
                return 'translateX(25px) rotateY(90deg)';
            case 'top':
                return 'translateY(-25px) rotateX(90deg)';
            case 'base':
                return 'translateY(25px) rotateX(-90deg)';
        }

        return '';
    }};
`;


export interface IStyledPluridViewcubeFaceZone {
    theme: Theme;
    type: string;
    hovered: boolean;
    transparentUI: boolean;
    active: boolean;
}

export const StyledPluridViewcubeFaceZone = styled.div<IStyledPluridViewcubeFaceZone>`
    display: grid;
    place-content: center;
    cursor: pointer;
    pointer-events: all;

    grid-area: ${({
        type,
    }) => `PVF${type}`};
    color: ${({
        theme,
        hovered,
    }) => {
        if (hovered) {
            return theme.colorPrimary;
        }
        return theme.colorSecondary;
    }};
    background-color: ${({
        theme,
        transparentUI,
        hovered,
        active,
    }) => {
        if (transparentUI && !hovered) {
            return theme.backgroundColorPrimaryAlpha;
        }

        if (active) {
            return theme.backgroundColorTertiary;
        }
        if (hovered) {
            return theme.backgroundColorTertiary;
        }
        return theme.backgroundColorSecondary;
    }};
    border: 1px solid ${({
        theme,
        transparentUI,
        hovered,
    }) => {
        if (transparentUI && !hovered) {
            return 'transparent';
        }

        if (hovered) {
            return theme.colorTertiary;
        }
        return theme.backgroundColorSecondary;
    }};

    :hover {
        background-color: ${({
            theme,
        }) => {
            return theme.backgroundColorTertiary;
        }};
    }
`;
// #endregion module
