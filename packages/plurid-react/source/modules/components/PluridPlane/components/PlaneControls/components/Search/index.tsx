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
    StyledSearch
} from './styled';

import SearchItem from '../SearchItem';

import { AppState } from '../../../../../../services/state/store';
import StateContext from '../../../../../../services/state/context';
import selectors from '../../../../../../services/state/selectors';
// import actions from '../../../../../../services/state/actions';



interface SearchOwnProperties {
    hideSearch: () => void;
}

interface SearchStateProperties {
    stateConfiguration: PluridConfiguration;
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
}

interface SearchDispatchProperties {
}

type SearchProperties = SearchOwnProperties
    & SearchStateProperties
    & SearchDispatchProperties;


const Search: React.FC<SearchProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** own */
        hideSearch,

        /** state */
        stateInteractionTheme,
    } = properties;


    /** render */
    return (
        <StyledSearch
            theme={stateInteractionTheme}
        >
            <ul>
                <SearchItem
                    text="/one"
                    hideSearch={hideSearch}
                />
                <SearchItem
                    text="/two"
                    hideSearch={hideSearch}
                />
                <SearchItem
                    text="/three"
                    hideSearch={hideSearch}
                />
                <SearchItem
                    text="/four"
                    hideSearch={hideSearch}
                />
                <SearchItem
                    text="/five"
                    hideSearch={hideSearch}
                />
            </ul>
        </StyledSearch>
    );
}


const mapStateToProps = (
    state: AppState,
): SearchStateProperties => ({
    stateConfiguration: selectors.configuration.getConfiguration(state),
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): SearchDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(Search);
