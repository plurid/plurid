// #region imports
    // #region libraries
    import React from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';


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
        // #endregion state
    } = properties;
    // #endregion properties


    // #region render
    return (
        <StyledPluridRoots
            style={{
                // width: typeof window !== 'undefined' ? window.innerWidth + 'px' : '1440px',
                width: '100%', // TOFIX
                height: typeof window !== 'undefined' ? window.innerHeight + 'px' : '821px',
                transform: spaceTransformMatrix,
                transition: spaceAnimatedTransform
                    ? `transform ${spaceTransformTime}ms ease-in-out`
                    // : firstPerson
                    //     ? 'transform 100ms linear'
                        : 'initial',
            }}
            data-plurid-entity={PLURID_ENTITY_ROOTS}
        >
            {stateTree.map(plane => {
                return (
                    <PluridRoot
                        key={plane.planeID}
                        plane={plane}
                    />
                );
            })}
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
