// #region imports
    // #region libraries
    import React from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';
    // #endregion libraries


    // #region exports
    import PluridSpace from '~components/structural/Space';
    import PluridOrigin from '~components/utilities/Origin';
    import PluridToolbar from '~components/utilities/Toolbar/General';
    import PluridViewcube from '~components/utilities/Viewcube';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    // import selectors from '~services/state/selectors';
    // import actions from '~services/state/actions';
    // #endregion exports
// #endregion imports



// #region module
export interface PluridPlanesViewOwnProperties {
}

export interface PluridPlanesViewStateProperties {
}

export interface PluridPlanesViewDispatchProperties {
}

export type PluridPlanesViewProperties =
    & PluridPlanesViewOwnProperties
    & PluridPlanesViewStateProperties
    & PluridPlanesViewDispatchProperties;


const PluridPlanesView: React.FC<PluridPlanesViewProperties> = (
    properties,
) => {
    // #region render
    return (
        <>
            <PluridSpace />

            <PluridOrigin />

            <PluridToolbar />

            <PluridViewcube />
        </>
    );
    // #endregion render
}


const mapStateToProps = (
    state: AppState,
): PluridPlanesViewStateProperties => ({
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridPlanesViewDispatchProperties => ({
});


const ConnectedPluridPlanesView = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridPlanesView);
// #endregion module



// #region exports
export default ConnectedPluridPlanesView;
// #endregion exports
