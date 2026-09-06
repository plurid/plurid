// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries

    // #region external
    import {
        BRIDGE_REACH_VARIABLE,
        BRIDGE_ANGLE_VARIABLE,
    } from '~services/logic/link/bridge';
    // #endregion external
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

    /* The stub meets the link's ANCHOR one bridge length away; the leash (two custom properties the
       link writes on the plane element while the link scrolls, services/logic/link/bridge.ts)
       stretches and tilts it to the link's current point. Unset, it is the plain stub. */
    position: absolute;
    top: 0;
    ${({ bridgeLength, bridgeSide }) => (bridgeSide === 'end'
        ? `right: calc(-1 * var(${BRIDGE_REACH_VARIABLE}, ${bridgeLength}px)); transform-origin: 0 0;`
        : `left: calc(-1 * var(${BRIDGE_REACH_VARIABLE}, ${bridgeLength}px)); transform-origin: 100% 0;`)}
    height: 30px;
    width: ${({ bridgeLength }) => `var(${BRIDGE_REACH_VARIABLE}, ${bridgeLength}px)`};
    transform: rotate(var(${BRIDGE_ANGLE_VARIABLE}, 0deg));
    opacity: 0.5;
    /* Decoration only. Seen nearly edge-on, a bridge's hit box lands over its parent's links
       (Chrome returned the uv plane's bridge on top of the detail plane's "lod →", 2026-09-05). */
    pointer-events: none;

    display: flex;
    align-items: center;
    justify-content: center;
`;
// #endregion module
