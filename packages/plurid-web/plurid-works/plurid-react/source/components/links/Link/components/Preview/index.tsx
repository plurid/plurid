// #region imports
    // #region libraries
    import React, {
        useContext,
    } from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';

    import {
        PluridContext
    } from '@plurid/plurid-data';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        getPlanesRegistrar,
    } from '@plurid/plurid-engine';
    // #endregion libraries


    // #region external
    import Context from '~services/context';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    // import actions from '~services/state/actions';
    // #endregion external


    // #region internal
    import {
        StyledPluridPlanePreview,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridPlanePreviewOwnProperties {
    planeID: string;
    linkCoordinates: any;
}

export interface PluridPlanePreviewStateProperties {
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
}

export interface PluridPlanePreviewDispatchProperties {
}

export type PluridPlanePreviewProperties = PluridPlanePreviewOwnProperties
    & PluridPlanePreviewStateProperties
    & PluridPlanePreviewDispatchProperties;


const PluridPlanePreview: React.FC<PluridPlanePreviewProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** own */
        planeID,
        linkCoordinates,

        /** state */
        stateGeneralTheme,
        // stateInteractionTheme,
    } = properties;


    /** context */
    const context = useContext(Context);

    if (!context) {
        return (<></>);
    }

    const {
        planesRegistrar,
    } = context;

    const planesRegistry = getPlanesRegistrar(planesRegistrar);

    if (!planesRegistry) {
        return (<></>);
    }

    const plane = planesRegistry.get(planeID);


    /** render */
    if (!plane) {
        return (<></>);
    }

    const Component = plane.component as any;

    return (
        <StyledPluridPlanePreview
            theme={stateGeneralTheme}
            linkCoordinates={linkCoordinates}
        >
            <Component />
        </StyledPluridPlanePreview>
    );
}


const mapStateToProperties = (
    state: AppState,
): PluridPlanePreviewStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridPlanePreviewDispatchProperties => ({
});


const ConnectedPluridPlanePreview = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridPlanePreview);
// #endregion module



// #region exports
export default ConnectedPluridPlanePreview;
// #endregion exports
