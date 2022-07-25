// #region imports
    // #region libraries
    import React from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        /** constants */
        PLURID_ENTITY_PLANE_BRIDGE,

        /** interfaces */
        TreePlane,
        PluridConfiguration,
    } from '@plurid/plurid-data';

    import {
        PluridIconArrowLeft,
    } from '@plurid/plurid-icons-react';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    // import actions from '~services/state/actions';

    import {
        navigateToPluridPlane,
    } from '~services/logic/animation';
    // #endregion external


    // #region internal
    import {
        StyledPluridPlaneBridge,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridPlaneBridgeOwnProperties {
    treePlane: TreePlane;
    parentTreePlane: TreePlane;
}

export interface PluridPlaneBridgeStateProperties {
    stateGeneralTheme: Theme;
    stateConfiguration: PluridConfiguration;
}

export interface PluridPlaneBridgeDispatchProperties {
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
}

export type PluridPlaneBridgeProperties =
    & PluridPlaneBridgeOwnProperties
    & PluridPlaneBridgeStateProperties
    & PluridPlaneBridgeDispatchProperties;

const PluridPlaneBridge: React.FC<PluridPlaneBridgeProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region own
        treePlane,
        parentTreePlane,
        // #endregion own

        // #region state
        stateGeneralTheme,
        stateConfiguration,
        // #endregion state

        // #region dispatch
        dispatch,
        // #endregion dispatch
    } = properties;

    const {
        controls,
        opacity,
    } = stateConfiguration.elements.plane;
    // #endregion properties


    // #region render
    return (
        <StyledPluridPlaneBridge
            theme={stateGeneralTheme}
            planeControls={controls.show}
            planeOpacity={opacity}
            data-plurid-entity={PLURID_ENTITY_PLANE_BRIDGE}
        >
            <PluridIconArrowLeft
                atClick={(event) => {
                    navigateToPluridPlane(
                        event,
                        parentTreePlane,
                        dispatch,
                    );
                }}
                theme={stateGeneralTheme}
                title="back"
            />
        </StyledPluridPlaneBridge>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PluridPlaneBridgeStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateConfiguration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridPlaneBridgeDispatchProperties => ({
    dispatch,
});


const ConnectedPluridPlaneBridge = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridPlaneBridge);
// #endregion module



// #region exports
export default ConnectedPluridPlaneBridge;
// #endregion exports
