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

import {
    uuid,
} from '@plurid/plurid-functions';

import {
    StyledSearchList,
    StyledSearchFilters,
} from './styled';

import SearchItem from '../SearchItem';

import { AppState } from '../../../../../../services/state/store';
import StateContext from '../../../../../../services/state/context';
import selectors from '../../../../../../services/state/selectors';
// import actions from '../../../../../../services/state/actions';



interface SearchListOwnProperties {
    hideSearch: () => void;
}

interface SearchListStateProperties {
    stateConfiguration: PluridConfiguration;
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
}

interface SearchListDispatchProperties {
}

type SearchListProperties = SearchListOwnProperties
    & SearchListStateProperties
    & SearchListDispatchProperties;


const SearchList: React.FC<SearchListProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** own */
        hideSearch,

        /** state */
        stateInteractionTheme,
    } = properties;

    const searchTerms = [
        '/one',
        '/two',
        '/three',
        '/four',
        '/five',
    ];


    /** render */
    return (
        <StyledSearchList
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
        </StyledSearchList>
    );
}


const mapStateToProps = (
    state: AppState,
): SearchListStateProperties => ({
    stateConfiguration: selectors.configuration.getConfiguration(state),
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): SearchListDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(SearchList);
