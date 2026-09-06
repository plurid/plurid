// #region imports
    // #region libraries
    import React, {
        useMemo,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';

    import styled from 'styled-components';


    import {

        chromeControl,

        chromeRoot,
        chromeDocked,
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
        Z_INDEX,
    } from '~data/constants/zIndex';
    // #endregion external


    // #region internal
    import {
        computeMinimapLayout,
        computeMinimapRing,
        MinimapDot,
    } from './logic';
    // #endregion internal
// #endregion imports



// #region module
const WIDTH = 172;
const HEIGHT = 120;
const PADDING = 14;


interface ThemedProperties {
    theme: Theme;
}

interface StyledMinimapProperties extends ThemedProperties {
    transparent: boolean;
}

const StyledMinimap = styled.div<StyledMinimapProperties>`
    ${chromeRoot}
    ${chromeDocked}
    position: absolute;
    top: 16px;
    right: 16px;
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    /* square, like a plane's window and the viewcube's faces */
    border-radius: 0;
    color: ${({ theme }) => theme.colorPrimary};
    overflow: hidden;
    z-index: ${Z_INDEX.MINIMAP};
    user-select: none;
    /* At rest exactly like a viewcube face: no fill, a faint 1px outline, 40 % opacity — the
       overview reads as a hint until the pointer comes over it, then it is the solid panel. */
    opacity: 0.4;
    background-color: transparent;
    border: 1px solid ${({ theme }) => theme.backgroundColorSecondary};
    box-shadow: none;
    transition: opacity 200ms ease, background-color 200ms ease, border-color 200ms ease, box-shadow 200ms ease;

    &:hover {
        opacity: 1;
        background-color: ${({ theme }) => theme.backgroundColorSecondary};
        border-color: ${({ theme }) => theme.backgroundColorTertiary};
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
    }
`;


interface StyledMinimapDotProperties extends ThemedProperties {
    active: boolean;
}

const StyledMinimapDot = styled.div<StyledMinimapDotProperties>`
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colorPrimary};
    box-shadow: ${({ active, theme }) =>
        active ? `0 0 0 3px ${theme.backgroundColorTertiary}` : 'none'};
    transition: opacity 120ms ease, width 120ms ease, height 120ms ease;
`;


/** The parent → child joins and the ring's heading tick, under the hits. */
const StyledMinimapLines = styled.svg`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: visible;
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
    display: grid;
    place-content: center;
    cursor: pointer;

    &:hover ${StyledMinimapDot} {
        opacity: 1;
    }
`;


export interface PluridMinimapStateProperties {
    stateConfiguration: PluridConfiguration;
    stateTree: TreePlane[];
    stateActivePlaneID: string;
    stateGeneralTheme: Theme;
    stateCamera: CameraState;
    stateViewSize: ViewSize;
}



/** The viewer — the camera's eye — a small ring on the map. */
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
 * A 2D overview of the space — a FIXED FRONT VIEW (world X across, Y down, see `./logic`): a dot per
 * shown plane at its center, farther planes smaller and dimmer, children smaller and joined to their
 * parent, the active plane highlighted, the ring on the VIEWER (the camera eye, moving with every
 * orbit / pan / zoom) with a tick toward the pivot; click-to-fly via
 * `navigateToPluridPlane`. The layout is a function of the tree (memoized); the camera only moves
 * the ring and the mark. Themed with the general theme; transparent by default and solid
 * while hovered. Opt-in — `configuration.elements.minimap.show`.
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
    const layout = useMemo(
        () => computeMinimapLayout({
            tree: stateTree,
            viewSize: stateViewSize,
            configuration: stateConfiguration,
            width: WIDTH,
            height: HEIGHT,
            padding: PADDING,
        }),
        [
            stateTree,
            stateViewSize,
            stateConfiguration,
        ],
    );

    if (!show) {
        return null;
    }

    if (layout.dots.length === 0) {
        return (
            <StyledMinimap
                theme={stateGeneralTheme}
                transparent={transparent}
            />
        );
    }

    const ring = computeMinimapRing(layout, stateCamera, stateViewSize, {
        width: WIDTH,
        height: HEIGHT,
        padding: PADDING,
    });

    // the click hands `navigateToPluridPlane` the very tree node (deep)
    const planeByID = new Map<string, TreePlane>();
    const index = (nodes: TreePlane[]) => {
        for (const node of nodes) {
            planeByID.set(node.planeID, node);
            if (node.children) {
                index(node.children);
            }
        }
    };
    index(stateTree);

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
            <StyledMinimapLines
                aria-hidden="true"
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            >
                {layout.links.map((link) => (
                    <line
                        key={link.planeID}
                        data-plurid-minimap-link={link.planeID}
                        x1={link.from.x}
                        y1={link.from.y}
                        x2={link.to.x}
                        y2={link.to.y}
                        stroke="currentColor"
                        strokeWidth={1}
                        strokeOpacity={0.5}
                    />
                ))}
                {(ring.tickX !== 0 || ring.tickY !== 0) && (
                    <line
                        data-plurid-minimap-heading={true}
                        x1={ring.x}
                        y1={ring.y}
                        x2={ring.x + ring.tickX}
                        y2={ring.y + ring.tickY}
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeOpacity={ring.clamped ? 0.5 : 1}
                    />
                )}
            </StyledMinimapLines>

            <StyledMinimapEye
                theme={stateGeneralTheme}
                style={{
                    left: ring.x,
                    top: ring.y,
                    opacity: ring.clamped ? 0.5 : 1,
                }}
                data-plurid-minimap-eye={true}
                data-plurid-minimap-clamped={ring.clamped ? 'true' : undefined}
            />

            {layout.dots.map((dot: MinimapDot) => {
                const plane = planeByID.get(dot.planeID);
                const active = dot.planeID === stateActivePlaneID;
                const size = active ? dot.size * 1.3 : dot.size;

                return (
                    <StyledMinimapHit
                        key={dot.planeID}
                        type="button"
                        title={dot.route}
                        aria-label={'go to plane ' + dot.route}
                        data-plurid-control="minimap-plane"
                        data-plurid-minimap-plane={dot.planeID}
                        data-plurid-minimap-depth={Math.round(dot.z)}
                        data-plurid-minimap-child={dot.child ? 'true' : undefined}
                        onClick={() => {
                            if (plane) {
                                navigateToPluridPlane(dispatch, plane);
                            }
                        }}
                        style={{
                            left: dot.x - dot.hit / 2,
                            top: dot.y - dot.hit / 2,
                            width: dot.hit,
                            height: dot.hit,
                            zIndex: dot.zIndex,
                        }}
                    >
                        <StyledMinimapDot
                            theme={stateGeneralTheme}
                            active={active}
                            style={{
                                width: size,
                                height: size,
                                opacity: active ? 1 : dot.opacity,
                            }}
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
