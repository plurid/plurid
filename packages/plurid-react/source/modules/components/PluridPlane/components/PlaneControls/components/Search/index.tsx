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

import { AppState } from '../../../../../../services/state/store';
import StateContext from '../../../../../../services/state/context';
import selectors from '../../../../../../services/state/selectors';
// import actions from '../../../../../../services/state/actions';



interface SearchOwnProperties {
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
        stateInteractionTheme,
    } = properties;


    /** render */
    return (
        <StyledSearch
            theme={stateInteractionTheme}
        >
            <ul>
                <li>
                    /one
                </li>
                <li>
                    /two
                </li>
                <li>
                    /three
                </li>
                <li>
                    /four
                </li>
                <li>
                    /five
                </li>
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
