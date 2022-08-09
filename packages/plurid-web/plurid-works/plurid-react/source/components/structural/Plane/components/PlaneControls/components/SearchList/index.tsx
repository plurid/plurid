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
        uuid,
    } from '@plurid/plurid-functions';

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

    import SearchItem from '../SearchItem';
    // #endregion external


    // #region internal
    import {
        StyledPluridSearchList,
        StyledSearchFilters,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridSearchListOwnProperties {
    hideSearch: () => void;
}

export interface PluridSearchListStateProperties {
    stateConfiguration: PluridConfiguration;
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
}

export interface PluridSearchListDispatchProperties {
}

export type PluridSearchListProperties =
    & PluridSearchListOwnProperties
    & PluridSearchListStateProperties
    & PluridSearchListDispatchProperties;


const PluridSearchList: React.FC<PluridSearchListProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region own
        hideSearch,
        // #endregion own

        // #region state
        stateInteractionTheme,
        // #endregion state
    } = properties;

    const searchTerms: any[] = [
        // '/one',
        // '/two',
        // '/three',
        // '/four',
        // '/five',
    ];
    // #endregion properties


    // #region render
    return (
        <StyledPluridSearchList
            theme={stateInteractionTheme}
        >
            <StyledSearchFilters>
                <div>
                    space - default
                </div>

                <div>
                    universe - default
                </div>

                <div>
                    cluster - default
                </div>
            </StyledSearchFilters>

            <ul>
                {searchTerms.map(searchTerm => {
                    return (
                        <SearchItem
                            key={uuid.generate()}
                            text={searchTerm}
                            hideSearch={hideSearch}
                        />
                    );
                })}
            </ul>
        </StyledPluridSearchList>
    );
    // #endregion render
}


const mapStateToProps = (
    state: AppState,
): PluridSearchListStateProperties => ({
    stateConfiguration: selectors.configuration.getConfiguration(state),
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridSearchListDispatchProperties => ({
});


const ConnectedPluridSearchList = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridSearchList);
// #endregion module



// #region exports
export default ConnectedPluridSearchList;
// #endregion exports
