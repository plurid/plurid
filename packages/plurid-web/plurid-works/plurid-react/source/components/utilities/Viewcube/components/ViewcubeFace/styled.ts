// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        chromeControl,
    } from '~services/styled/chrome';

    import {
        Theme,
    } from '@plurid/plurid-themes';
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
    font-size: var(--plurid-font-size-small);
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
            return 'var(--plurid-ink-muted)';
        }
        return 'var(--plurid-rim)';
    }};
    box-shadow: ${({
        face,
    }) => {
        if (face === 'base') {
            return '0px 0px 12px 2px var(--plurid-halo)';
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
    zone: string;
    hovered: boolean;
    transparentUI: boolean;
    active: boolean;
}

export const StyledPluridViewcubeFaceZone = styled.button<IStyledPluridViewcubeFaceZone>`
    ${chromeControl}
    border: 0;
    padding: 0;
    margin: 0;
    font: inherit;
    background: none;

    &:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: -2px;
    }
    display: grid;
    place-content: center;
    cursor: pointer;
    pointer-events: all;

    grid-area: ${({
        zone,
    }) => `PVF${zone}`};
    color: ${({
        theme,
        hovered,
    }) => {
        if (hovered) {
            return 'var(--plurid-ink)';
        }
        return 'var(--plurid-ink-muted)';
    }};
    background-color: ${({
        theme,
        transparentUI,
        hovered,
        active,
    }) => {
        if (transparentUI && !hovered) {
            return 'var(--plurid-surface)';
        }

        if (active) {
            return 'var(--plurid-surface-strong)';
        }
        if (hovered) {
            return 'var(--plurid-surface-strong)';
        }
        return 'var(--plurid-surface-solid)';
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
            return 'var(--plurid-ink-faint)';
        }
        return 'var(--plurid-surface-solid)';
    }};

    &:hover {
        background-color: ${({
            theme,
        }) => {
            return 'var(--plurid-surface-strong)';
        }};
    }
`;
// #endregion module
