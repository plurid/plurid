// #region imports
    // #region libraries
    import React from 'react';

    import { connect } from 'react-redux';
    // #endregion libraries


    // #region external
    import selectors from '~kernel-services/state/selectors';
    // import actions from '~kernel-services/state/actions';
    // #endregion external


    // #region internal
    import {
        StyledHome,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const Home = (
    properties,
) => {
    // #region properties
    // const {
        // /** state */
        // stateGeneralTheme,
        // stateInteractionTheme,
    // } = properties;
    // #endregion properties


    // #region render
    return (
        <StyledHome>
            Home
        </StyledHome>
    );
    // #endregion render
}


const mapStateToProperties = (
    state,
) => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch,
) => ({
});


const ConnectedHome = connect(
    mapStateToProperties,
    mapDispatchToProperties,
)(Home);
// #endregion module



// #region exports
export default ConnectedHome;
// #endregion exports
