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
        StyledPluridSearchItem
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

export type PluridSearchItemProperties = PluridSearchItemOwnProperties
    & PluridSearchItemStateProperties
    & PluridSearchItemDispatchProperties;


const PluridSearchItem: React.FC<PluridSearchItemProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** own */
        text,
        hideSearch,

        /** state */
        stateInteractionTheme,
    } = properties;


    /** handlers */
    const handleClickSearch = () => {
        hideSearch();
        console.log('text', text);
    }


    /** render */
    return (
        <StyledPluridSearchItem
            theme={stateInteractionTheme}
            onClick={handleClickSearch}
        >
            {text}
        </StyledPluridSearchItem>
    );
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
