// #region imports
    // #region libraries
    import React from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';

    import styled from 'styled-components';


    import {

        chromeControl,

        chromeRoot,

    } from '~services/styled/chrome';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PluridConfiguration,
        TreePlane,
        CameraState,
        ViewSize,
        PLURID_ENTITY_MINIMAP,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';

    import {
        navigateToPluridPlane,
    } from '~services/logic/animation';

    import {
        interaction,
    } from '~services/engine';

    import {
        Z_INDEX,
    } from '~data/constants/zIndex';
    // #endregion external
// #endregion imports



// #region module
const WIDTH = 172;
const HEIGHT = 120;
const PADDING = 14;
const HIT = 26;  // generous click target


interface ThemedProperties {
    theme: Theme;
}

interface StyledMinimapProperties extends ThemedProperties {
    transparent: boolean;
}

const StyledMinimap = styled.div<StyledMinimapProperties>`
    ${chromeRoot}
    position: absolute;
    top: 16px;
    right: 16px;
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    border-radius: 6px;
    color: ${({ theme }) => theme.colorPrimary};
    overflow: hidden;
    z-index: ${Z_INDEX.MINIMAP};
    user-select: none;
    transition: background-color 200ms ease, border-color 200ms ease, box-shadow 200ms ease;

    /* When transparent: an unobtrusive see-through overview, solid only on hover. When not: always
       solid (the hover rule below just resolves to the same values). */
    background-color: ${({ theme, transparent }) =>
        transparent ? theme.backgroundColorPrimaryAlpha : theme.backgroundColorSecondary};
    border: 1px solid ${({ theme, transparent }) =>
        transparent ? 'transparent' : theme.backgroundColorTertiary};
    box-shadow: ${({ transparent }) =>
        transparent ? 'none' : '0 4px 18px rgba(0, 0, 0, 0.35)'};

    &:hover {
        background-color: ${({ theme }) => theme.backgroundColorSecondary};
        border-color: ${({ theme }) => theme.backgroundColorTertiary};
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
    }
`;


interface StyledMinimapDotProperties extends ThemedProperties {
    active: boolean;
}

const StyledMinimapDot = styled.div<StyledMinimapDotProperties>`
    width: ${({ active }) => (active ? 13 : 10)}px;
    height: ${({ active }) => (active ? 13 : 10)}px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colorPrimary};
    opacity: ${({ active }) => (active ? 1 : 0.5)};
    box-shadow: ${({ active, theme }) =>
        active ? `0 0 0 3px ${theme.backgroundColorTertiary}` : 'none'};
    transition: opacity 120ms ease, width 120ms ease, height 120ms ease;
`;

/** A generous transparent hit target centered on the plane's projected point — a real button. */
const StyledMinimapHit = styled.button`
    ${chromeControl}
    border: 0;
    padding: 0;
    margin: 0;
    background: none;
    font: inherit;
    color: inherit;
    position: absolute;

    &:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: -2px;
        border-radius: 50%;
    }
    width: ${HIT}px;
    height: ${HIT}px;
    display: grid;
    place-content: center;
    cursor: pointer;

    &:hover ${StyledMinimapDot} {
        opacity: 1;
    }
`;


/** Flatten the (visible) tree into a list of planes — minimap shows roots + spawned children. */
const flattenVisible = (
    tree: TreePlane[],
): TreePlane[] => {
    const planes: TreePlane[] = [];
    const walk = (nodes: TreePlane[]) => {
        for (const node of nodes) {
            if (node.show) {
                planes.push(node);
            }
            if (node.children) {
                walk(node.children);
            }
        }
    };
    walk(tree);
    return planes;
}


export interface PluridMinimapStateProperties {
    stateConfiguration: PluridConfiguration;
    stateTree: TreePlane[];
    stateActivePlaneID: string;
    stateGeneralTheme: Theme;
    stateCamera: CameraState;
    stateViewSize: ViewSize;
}

/** The camera's eye, a small ring on the map. */
const StyledMinimapEye = styled.div<ThemedProperties>`
    position: absolute;
    width: 9px;
    height: 9px;
    margin: -4.5px 0 0 -4.5px;
    border-radius: 50%;
    border: 2px solid ${({ theme }) => theme.colorPrimary};
    pointer-events: none;
    box-sizing: border-box;
`;

export interface PluridMinimapDispatchProperties {
    dispatch: ThunkDispatch<{}, {}, AnyAction>;
}

export type PluridMinimapProperties =
    & PluridMinimapStateProperties
    & PluridMinimapDispatchProperties;


/**
 * A 2D overview of the space: a dot per visible plane, projected onto the two world axes with the
 * most spread (so a wall-style layout reads as a front elevation, a depth-style one as a top-down
 * plan), the active plane highlighted, click-to-fly via `navigateToPluridPlane`. Themed with the
 * general theme; transparent (see-through) by default and solid only while hovered, so it stays
 * unobtrusive. Opt-in — `configuration.elements.minimap.show`. (A camera position/heading marker
 * is a planned v2.)
 */
const PluridMinimap: React.FC<PluridMinimapProperties> = (
    properties,
) => {
    // #region properties
    const {
        stateConfiguration,
        stateTree,
        stateActivePlaneID,
        stateGeneralTheme,
        stateCamera,
        stateViewSize,
        dispatch,
    } = properties;

    const show = stateConfiguration.elements.minimap?.show;
    const transparent = stateConfiguration.elements.minimap?.transparent ?? true;
    // #endregion properties


    // #region render
    if (!show) {
        return null;
    }

    const planes = flattenVisible(stateTree);
    if (planes.length === 0) {
        return (
            <StyledMinimap
                theme={stateGeneralTheme}
                transparent={transparent}
            />
        );
    }

    // A DETERMINISTIC projection: world X runs horizontally; the vertical axis is Z (a top-down
    // plan) when the space has depth, else Y (a front elevation for the wall-style layouts). The
    // choice depends only on whether any plane is off the Z = 0 wall, never on which axis happens
    // to span more — so the map cannot swap its axes as planes move.
    const hasDepth = planes.some(plane => Math.abs(plane.location.translateZ) > 1);
    const vertical: 'translateY' | 'translateZ' = hasDepth ? 'translateZ' : 'translateY';
    const eye = interaction.camera.eyeWorld(stateCamera, stateViewSize);
    const points = [
        ...planes.map(plane => ({ x: plane.location.translateX, y: plane.location[vertical] })),
        { x: eye.x, y: vertical === 'translateZ' ? eye.z : eye.y },
    ];
    const minX = Math.min(...points.map(point => point.x));
    const maxX = Math.max(...points.map(point => point.x));
    const minY = Math.min(...points.map(point => point.y));
    const maxY = Math.max(...points.map(point => point.y));
    const spanX = (maxX - minX) || 1;
    const spanY = (maxY - minY) || 1;
    // one scale for both axes, so the map keeps the space's proportions
    const scale = Math.min((WIDTH - 2 * PADDING) / spanX, (HEIGHT - 2 * PADDING) / spanY);
    const offsetX = PADDING + ((WIDTH - 2 * PADDING) - spanX * scale) / 2;
    const offsetY = PADDING + ((HEIGHT - 2 * PADDING) - spanY * scale) / 2;

    const project = (point: { x: number; y: number }) => ({
        x: offsetX + (point.x - minX) * scale,
        y: offsetY + (point.y - minY) * scale,
    });
    const eyePoint = project(points[points.length - 1]);

    return (
        <StyledMinimap
            data-plurid-entity={PLURID_ENTITY_MINIMAP}
            data-plurid-minimap={true}
            data-plurid-overlay="minimap"
            data-plurid-control="minimap"
            role="group"
            aria-label="space overview"
            theme={stateGeneralTheme}
            transparent={transparent}
        >
            <StyledMinimapEye
                theme={stateGeneralTheme}
                style={{
                    left: eyePoint.x,
                    top: eyePoint.y,
                }}
                data-plurid-minimap-eye={true}
            />

            {planes.map(plane => {
                const { x, y } = project({ x: plane.location.translateX, y: plane.location[vertical] });
                const active = plane.planeID === stateActivePlaneID;

                return (
                    <StyledMinimapHit
                        key={plane.planeID}
                        type="button"
                        title={plane.route}
                        aria-label={'go to plane ' + plane.route}
                        data-plurid-control="minimap-plane"
                        onClick={() => navigateToPluridPlane(dispatch, plane)}
                        style={{
                            left: x - HIT / 2,
                            top: y - HIT / 2,
                        }}
                    >
                        <StyledMinimapDot
                            theme={stateGeneralTheme}
                            active={active}
                        />
                    </StyledMinimapHit>
                );
            })}
        </StyledMinimap>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PluridMinimapStateProperties => ({
    stateConfiguration: selectors.configuration.getConfiguration(state),
    stateTree: selectors.space.getTree(state),
    stateActivePlaneID: selectors.space.getActivePlaneID(state),
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateCamera: selectors.space.getCamera(state),
    stateViewSize: selectors.space.getViewSize(state),
});

const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridMinimapDispatchProperties => ({
    dispatch,
});


const ConnectedPluridMinimap = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridMinimap);
// #endregion module



// #region exports
export default ConnectedPluridMinimap;
// #endregion exports
