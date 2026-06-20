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
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PluridConfiguration,
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';

    import {
        navigateToPluridPlane,
    } from '~services/logic/animation';
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
    position: fixed;
    top: 16px;
    right: 16px;
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    border-radius: 6px;
    color: ${({ theme }) => theme.colorPrimary};
    overflow: hidden;
    z-index: 999;
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

/** A generous transparent hit target centered on the plane's projected point. */
const StyledMinimapHit = styled.div`
    position: absolute;
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
}

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

    // Project onto the two world axes with the most spread, so the overview fits the actual layout:
    // a wall-style layout (COLUMNS/ROWS — X/Y spread, Z flat) reads as a front elevation, a
    // depth-style layout (X/Z spread) reads as a top-down plan. Avoids collapsing rows onto each other.
    const AXES = ['translateX', 'translateY', 'translateZ'] as const;
    const stats = AXES.map(axis => {
        const values = planes.map(plane => plane.location[axis]);
        const min = Math.min(...values);
        const max = Math.max(...values);
        return { axis, min, span: (max - min) || 1 };
    }).sort((a, b) => b.span - a.span);
    const [hAxis, vAxis] = stats;

    const project = (plane: TreePlane) => ({
        x: PADDING + ((plane.location[hAxis.axis] - hAxis.min) / hAxis.span) * (WIDTH - 2 * PADDING),
        y: PADDING + ((plane.location[vAxis.axis] - vAxis.min) / vAxis.span) * (HEIGHT - 2 * PADDING),
    });

    return (
        <StyledMinimap
            data-plurid-minimap={true}
            theme={stateGeneralTheme}
            transparent={transparent}
        >
            {planes.map(plane => {
                const { x, y } = project(plane);
                const active = plane.planeID === stateActivePlaneID;

                return (
                    <StyledMinimapHit
                        key={plane.planeID}
                        title={plane.route}
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
