import React from 'react';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    /** constants */

    /** interfaces */
    PluridConfiguration,
} from '@plurid/plurid-data';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    StyledUniverseExplorer,
} from './styled';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
import selectors from '../../services/state/selectors';
// import actions from '../../services/state/actions';



interface ViewcubeOwnProperties {
}

interface ViewcubeStateProperties {
    stateConfiguration: PluridConfiguration;
    stateInteractionTheme: Theme;
}

interface ViewcubeDispatchProperties {
}

type ViewcubeProperties = ViewcubeOwnProperties
    & ViewcubeStateProperties
    & ViewcubeDispatchProperties;


const Viewcube: React.FC<ViewcubeProperties> = (
    properties,
) => {
    const {
        /** state */
        stateConfiguration,
        stateInteractionTheme,

        /** dispatch */
    } = properties;


    return (
        <StyledUniverseExplorer
            // data-plurid-entity={PLURID_ENTITY_UNIVERSE_EXPLORER}
        >
            <div>
                <div>
                    view zone
                </div>

                clusters window
            </div>

            <div>
                reset
            </div>

            <div>
                fit
            </div>
        </StyledUniverseExplorer>
    );
}


const mapStateToProperties = (
    state: AppState,
): ViewcubeStateProperties => ({
    stateConfiguration: selectors.configuration.getConfiguration(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): ViewcubeDispatchProperties => ({
});


export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(Viewcube);
