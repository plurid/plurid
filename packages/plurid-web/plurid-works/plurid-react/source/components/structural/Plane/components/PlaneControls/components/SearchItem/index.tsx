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
        /** interfaces */
        PluridConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    // import actions from '~services/state/actions';
    // #endregion external


    // #region internal
    import {
        StyledPluridSearchItem,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridSearchItemOwnProperties {
    text: string;
    hideSearch: () => void;
}

export interface PluridSearchItemStateProperties {
    stateConfiguration: PluridConfiguration;
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
}

export interface PluridSearchItemDispatchProperties {
}

export type PluridSearchItemProperties =
    & PluridSearchItemOwnProperties
    & PluridSearchItemStateProperties
    & PluridSearchItemDispatchProperties;


const PluridSearchItem: React.FC<PluridSearchItemProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region own
        text,
        hideSearch,
        // #endregion own

        // #region state
        stateInteractionTheme,
        // #endregion state
    } = properties;
    // #endregion properties


    // #region handlers
    const handleClickSearch = () => {
        hideSearch();
    }
    // #endregion handlers


    // #region render
    return (
        <StyledPluridSearchItem
            theme={stateInteractionTheme}
            onClick={handleClickSearch}
        >
            {text}
        </StyledPluridSearchItem>
    );
    // #endregion render
}


const mapStateToProps = (
    state: AppState,
): PluridSearchItemStateProperties => ({
    stateConfiguration: selectors.configuration.getConfiguration(state),
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridSearchItemDispatchProperties => ({
});


const ConnectedPluridSearchItem = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridSearchItem);
// #endregion module



// #region exports
export default ConnectedPluridSearchItem;
// #endregion exports
