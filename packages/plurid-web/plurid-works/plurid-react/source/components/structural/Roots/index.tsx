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
    spaceAnimatedTransform: boolean;
    stateResolvedLayout: boolean;
    spaceTransformTime: number;
    stateTree: TreePlane[];
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
        spaceTransformMatrix,
        spaceAnimatedTransform,
        spaceTransformTime,
        stateTree,
        stateResolvedLayout,
        // #endregion state
    } = properties;
    // #endregion properties


    // #region render
    // TOFIX use user width/height
    const width = '100%';
    const height = stateResolvedLayout
        ? window.innerHeight + 'px'
        : 0;

    const transition = spaceAnimatedTransform
        ? `transform ${spaceTransformTime}ms ease-in-out`
        // : firstPerson
        //     ? 'transform 100ms linear'
        : 'initial';

    return (
        <StyledPluridRoots
            style={{
                width,
                height,
                transition,
                transform: spaceTransformMatrix,
            }}
            data-plurid-entity={PLURID_ENTITY_ROOTS}
        >
            {stateTree.map(plane => (
                <PluridRoot
                    key={plane.planeID}
                    plane={plane}
                />
            ))}
        </StyledPluridRoots>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PluridRootsStateProperties => ({
    stateConfiguration: selectors.configuration.getConfiguration(state),
    spaceTransformMatrix: selectors.space.getTransformMatrix(state),
    spaceAnimatedTransform: selectors.space.getAnimatedTransform(state),
    spaceTransformTime: selectors.space.getTransformTime(state),
    stateTree: selectors.space.getTree(state),
    stateResolvedLayout: selectors.space.getResolvedLayout(state),
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
