// #region imports
    // #region libraries
    import React from 'react';

    import { connect } from 'react-redux';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        TreePlane,
        PluridConfigurationSpaceSnap,

        PLURID_ENTITY_ALIGNMENT_GUIDES,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';

    import {
        space as spaceEngine,
    } from '~services/engine';

    import {
        resolvePlaneFallbackSize,
    } from '~services/logic/camera';
    // #endregion external


    // #region internal
    import {
        StyledAlignmentGuides,
        StyledAlignmentGuide,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const SPAN = 8000;      // px — guide line length (covers the working space)


export interface AlignmentGuidesStateProperties {
    stateDraggingSelection: boolean;
    stateTree: TreePlane[];
    stateSelectedPlaneIDs: string[];
    stateGeneralTheme: Theme;
    stateSnap: PluridConfigurationSpaceSnap | undefined;
    stateFallback: { width: number; height: number };
}

export type AlignmentGuidesProperties = AlignmentGuidesStateProperties;


/**
 * The lines a drag release would snap to — computed by the SAME `computeSnap` the release uses,
 * with the same threshold, edges and grid, so the preview is exactly what lands. Rendered only
 * mid-drag, inside the camera container (the guides ride the transform).
 */
const AlignmentGuides: React.FC<AlignmentGuidesProperties> = (
    properties,
) => {
    const {
        stateDraggingSelection,
        stateTree,
        stateSelectedPlaneIDs,
        stateGeneralTheme,
        stateSnap,
        stateFallback,
    } = properties;

    // #region render
    if (!stateDraggingSelection || stateSelectedPlaneIDs.length === 0 || stateSnap?.enabled === false) {
        return null;
    }

    const {
        selection,
        others,
    } = spaceEngine.snap.collectSnapBoxes(stateTree, new Set(stateSelectedPlaneIDs), stateFallback);
    if (selection.length === 0) {
        return null;
    }

    const {
        guides,
    } = spaceEngine.snap.computeSnap(selection, others, {
        threshold: stateSnap?.threshold,
        grid: stateSnap?.grid,
    });
    if (guides.length === 0) {
        return null;
    }

    return (
        <StyledAlignmentGuides
            data-plurid-entity={PLURID_ENTITY_ALIGNMENT_GUIDES}
        >
            {guides.map((guide, index) => (
                <StyledAlignmentGuide
                    key={guide.axis + index}
                    theme={stateGeneralTheme}
                    data-plurid-guide={guide.axis}
                    data-plurid-guide-edge={guide.edge}
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
    stateSnap: state.configuration.space.snap,
    stateFallback: resolvePlaneFallbackSize(state.configuration, state.space.viewSize),
});


const ConnectedAlignmentGuides = connect(
    mapStateToProperties,
    null,
    null,
    {
        context: StateContext,
    },
)(AlignmentGuides);
// #endregion module



// #region exports
export default ConnectedAlignmentGuides;
// #endregion exports
