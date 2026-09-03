// #region imports
    // #region libraries
    import React from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';


    import {
        /** constants */
        PLURID_ENTITY_ROOTS,

        /** interfaces */
        TreePlane,
        PluridConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import PluridRoot from '~components/structural/Root';
    import PluridPlaneLinks from '~components/structural/PlaneLinks';
    import AlignmentGuides from '~components/structural/AlignmentGuides';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    // import actions from '~services/state/actions';
    // #endregion external


    // #region internal
    import {
        StyledPluridRoots,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridRootsOwnProperties {
}

export interface PluridRootsStateProperties {
    stateConfiguration: PluridConfiguration;
    spaceTransformMatrix: string;
    stateResolvedLayout: boolean;
    stateTree: TreePlane[];
    stateViewHeight: number;
    /** `will-change: transform` only while the camera is in motion (a tween or a fling). */
    stateMotion: string;
}

export interface PluridRootsDispatchProperties {
}

export type PluridRootsProperties =
    & PluridRootsOwnProperties
    & PluridRootsStateProperties
    & PluridRootsDispatchProperties;


const PluridRoots: React.FC<PluridRootsProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region state
        stateConfiguration,
        spaceTransformMatrix,
        stateTree,
        stateResolvedLayout,
        stateViewHeight,
        stateMotion,
        // #endregion state
    } = properties;
    // #endregion properties


    // #region render
    // `space.dimensions` (opt-in) sizes the roots container; the defaults are
    // the historical behavior (fill the host horizontally, window vertically).
    const dimensions = stateConfiguration.space.dimensions;
    const resolveDimension = (
        value: number | string | undefined,
        fallback: string | number,
    ) => value === undefined
        ? fallback
        : typeof value === 'number' ? value + 'px' : value;

    // The default height is the MEASURED view height (the camera's pivot frame), not the raw
    // window — so an embedded space sizes to its container, and SSR never touches `window`.
    const width = resolveDimension(dimensions?.width, '100%');
    const height = stateResolvedLayout
        ? resolveDimension(dimensions?.height, stateViewHeight + 'px')
        : 0;

    // No CSS transition on the camera: programmatic moves tween through the motion controller (one
    // commit per frame, interruptible), and a transition would fight live input.
    const transition = 'none';

    return (
        <StyledPluridRoots
            style={{
                width,
                height,
                transition,
                transform: spaceTransformMatrix,
                willChange: stateMotion !== 'idle' ? 'transform' : undefined,
            }}
            data-plurid-entity={PLURID_ENTITY_ROOTS}
        >
            {stateTree.map(plane => (
                <PluridRoot
                    key={plane.planeID}
                    plane={plane}
                />
            ))}

            {stateConfiguration.elements.planeLinks?.show !== false && (
                <PluridPlaneLinks />
            )}
            {stateConfiguration.elements.alignmentGuides?.show !== false && (
                <AlignmentGuides />
            )}
        </StyledPluridRoots>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PluridRootsStateProperties => ({
    stateConfiguration: selectors.configuration.getConfiguration(state),
    spaceTransformMatrix: selectors.space.getTransformMatrix(state),
    stateTree: selectors.space.getTree(state),
    stateResolvedLayout: selectors.space.getResolvedLayout(state),
    stateViewHeight: selectors.space.getViewSize(state).height,
    stateMotion: selectors.space.getMotion(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridRootsDispatchProperties => ({
});


const ConnectedPluridRoots = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridRoots);
// #endregion module



// #region exports
export default ConnectedPluridRoots;
// #endregion exports
