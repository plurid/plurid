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
    StyledPluridSearchList,
    StyledSearchFilters,
} from './styled';

import SearchItem from '../SearchItem';

import { AppState } from '../../../../../../services/state/store';
import StateContext from '../../../../../../services/state/context';
import selectors from '../../../../../../services/state/selectors';
// import actions from '../../../../../../services/state/actions';



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

export type PluridSearchListProperties = PluridSearchListOwnProperties
    & PluridSearchListStateProperties
    & PluridSearchListDispatchProperties;


const PluridSearchList: React.FC<PluridSearchListProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** own */
        hideSearch,

        /** state */
        stateInteractionTheme,
    } = properties;

    const searchTerms: any[] = [
        // '/one',
        // '/two',
        // '/three',
        // '/four',
        // '/five',
    ];


    /** render */
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


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridSearchList);
