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

    const searchTerms = [
        '/one',
        '/two',
        '/three',
        '/four',
        '/five',
    ];


    /** render */
    return (
        <StyledSearch
            theme={stateInteractionTheme}
        >
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
