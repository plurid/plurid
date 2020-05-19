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
    StyledSearchItem
} from './styled';

import { AppState } from '../../../../../../services/state/store';
import StateContext from '../../../../../../services/state/context';
import selectors from '../../../../../../services/state/selectors';
// import actions from '../../../../../../services/state/actions';



interface SearchItemOwnProperties {
    text: string;
    hideSearch: () => void;
}

interface SearchItemStateProperties {
    stateConfiguration: PluridConfiguration;
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
}

interface SearchItemDispatchProperties {
}

type SearchItemProperties = SearchItemOwnProperties
    & SearchItemStateProperties
    & SearchItemDispatchProperties;


const SearchItem: React.FC<SearchItemProperties> = (
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
        <StyledSearchItem
            theme={stateInteractionTheme}
            onClick={handleClickSearch}
        >
            {text}
        </StyledSearchItem>
    );
}


const mapStateToProps = (
    state: AppState,
): SearchItemStateProperties => ({
    stateConfiguration: selectors.configuration.getConfiguration(state),
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): SearchItemDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(SearchItem);
