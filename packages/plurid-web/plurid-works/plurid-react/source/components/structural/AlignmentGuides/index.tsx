// #region imports
    // #region libraries
    import React from 'react';

    import { connect } from 'react-redux';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    // #endregion external


    // #region internal
    import {
        StyledAlignmentGuides,
        StyledAlignmentGuide,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const THRESHOLD = 12;   // px — same as the release snap, so the guide previews exactly where it lands
const SPAN = 8000;      // px — guide line length (covers the working space)


export interface AlignmentGuidesStateProperties {
    stateDraggingSelection: boolean;
    stateTree: TreePlane[];
    stateSelectedPlaneIDs: string[];
    stateGeneralTheme: Theme;
}

export type AlignmentGuidesProperties = AlignmentGuidesStateProperties;


interface Guide {
    axis: 'x' | 'y';
    position: number;
}

/** The nearest left/top-edge alignment of any selected plane to any other plane, within THRESHOLD. */
const nearestEdge = (
    sel: TreePlane[],
    others: TreePlane[],
    axis: 'translateX' | 'translateY',
): number | null => {
    let position: number | null = null;
    let bestAbs = THRESHOLD;
    for (const s of sel) {
        for (const o of others) {
            const distance = Math.abs(o.location[axis] - s.location[axis]);
            if (distance <= bestAbs) {
                bestAbs = distance;
                position = o.location[axis];
            }
        }
    }
    return position;
}


const AlignmentGuides: React.FC<AlignmentGuidesProperties> = (
    properties,
) => {
    const {
        stateDraggingSelection,
        stateTree,
        stateSelectedPlaneIDs,
        stateGeneralTheme,
    } = properties;


    // #region render
    // Only ever rendered mid-drag, and only the lines a release would actually snap to.
    if (!stateDraggingSelection || stateSelectedPlaneIDs.length === 0) {
        return null;
    }

    const all: TreePlane[] = [];
    const collect = (nodes: TreePlane[]) => {
        for (const node of nodes) {
            all.push(node);
            if (node.children) {
                collect(node.children);
            }
        }
    };
    collect(stateTree);

    const selected = new Set(stateSelectedPlaneIDs);
    const sel = all.filter(p => selected.has(p.planeID) && p.show !== false);
    const others = all.filter(p => !selected.has(p.planeID) && p.show !== false);
    if (sel.length === 0 || others.length === 0) {
        return null;
    }

    const guides: Guide[] = [];
    const x = nearestEdge(sel, others, 'translateX');
    if (x !== null) {
        guides.push({ axis: 'x', position: x });
    }
    const y = nearestEdge(sel, others, 'translateY');
    if (y !== null) {
        guides.push({ axis: 'y', position: y });
    }
    if (guides.length === 0) {
        return null;
    }

    return (
        <StyledAlignmentGuides>
            {guides.map((guide, index) => (
                <StyledAlignmentGuide
                    key={guide.axis + index}
                    theme={stateGeneralTheme}
                    data-plurid-guide={guide.axis}
                    style={guide.axis === 'x'
                        ? {
                            width: '1px',
                            height: SPAN + 'px',
                            transform: `translate3d(${guide.position}px, ${-SPAN / 2}px, 0)`,
                        }
                        : {
                            width: SPAN + 'px',
                            height: '1px',
                            transform: `translate3d(${-SPAN / 2}px, ${guide.position}px, 0)`,
                        }
                    }
                />
            ))}
        </StyledAlignmentGuides>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): AlignmentGuidesStateProperties => ({
    stateDraggingSelection: selectors.space.getDraggingSelection(state),
    stateTree: selectors.space.getTree(state),
    stateSelectedPlaneIDs: selectors.space.getSelectedPlaneIDs(state),
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
});


const ConnectedAlignmentGuides = connect(
    mapStateToProperties,
    null,
    null,
    {
        context: StateContext,
    },
)(React.memo(AlignmentGuides));
// #endregion module



// #region exports
export default ConnectedAlignmentGuides;
// #endregion exports
