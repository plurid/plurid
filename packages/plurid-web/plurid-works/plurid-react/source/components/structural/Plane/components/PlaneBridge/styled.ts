// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledPluridPlaneBridge {
    theme: Theme;
    planeControls: boolean;
    planeOpacity: number;
    transparentUI: boolean;
    mouseOver: boolean;
    bridgeLength: number;
    /** The plane edge the bridge leaves from (`TreePlane.bridgeSide`). */
    bridgeSide: 'start' | 'end';
}

export const StyledPluridPlaneBridge = styled.div<IStyledPluridPlaneBridge>`
    background-color: ${({
        theme,
        planeControls,
        planeOpacity,
        transparentUI,
        mouseOver,
    }) => {
        if (transparentUI && !mouseOver) {
            return theme.backgroundColorPrimaryAlpha;
        }

        if (planeOpacity === 0) {
            return 'transparent';
        }

        if (!planeControls) {
            return theme.backgroundColorPrimary;
        }

        return theme.backgroundColorDark;
    }};

    position: absolute;
    top: 0;
    ${({ bridgeLength, bridgeSide }) => (bridgeSide === 'end'
        ? `right: ${-bridgeLength}px;`
        : `left: ${-bridgeLength}px;`)}
    height: 30px;
    width: ${({ bridgeLength }) => bridgeLength}px;
    opacity: 0.5;
    /* Decoration only. Seen nearly edge-on, a bridge's hit box lands over its parent's links
       (Chrome returned the uv plane's bridge on top of the detail plane's "lod →", 2026-09-05). */
    pointer-events: none;

    display: flex;
    align-items: center;
    justify-content: center;
`;
// #endregion module
