// #region imports
    // #region libraries
    import React from 'react';

    import { connect } from 'react-redux';
    // #endregion libraries


    // #region external
    import StateContext from '../../services/state/context';
    import selectors from '../../services/state/selectors';
    // import actions from '../../services/state/actions';
    // #endregion external


    // #region internal
    import {
        StyledNotFound,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const NotFound = (
    properties,
) => {
    // #region properties
    const {
        // #region state
        stateGeneralNotFoundFace,
        // #endregion state
    } = properties;
    // #endregion properties


    // #region render
    return (
        <StyledNotFound>
            <h1>
                {stateGeneralNotFoundFace}
            </h1>

            <p>
                you searched and it's not here
            </p>
        </StyledNotFound>
    );
    // #endregion render
}


const mapStateToProperties = (
    state,
) => ({
    stateGeneralNotFoundFace: selectors.general.getNotFoundFace(state),
});


const mapDispatchToProperties = (
    dispatch,
) => ({
});


const ConnectedNotFound = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(NotFound);
// #endregion module



// #region exports
export default ConnectedNotFound;
// #endregion exports
