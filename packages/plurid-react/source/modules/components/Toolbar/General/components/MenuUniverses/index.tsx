import React from 'react';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    Indexed,
    PluridInternalStateUniverse,
} from '@plurid/plurid-data';

import {
    StyledMoreMenu,
    // StyledMoreMenuItem,
    StyledMoreMenuScroll,
    StyledMenuUniversesItemList,
} from './styled';

import { AppState } from '../../../../../services/state/store';
import StateContext from '../../../../../services/state/context';
import selectors from '../../../../../services/state/selectors';
import actions from '../../../../../services/state/actions';



export interface MoreMenuOwnProperties {
}

export interface MoreMenuStateProperties {
    interactionTheme: Theme;
    documents: Indexed<PluridInternalStateUniverse>;
    activeUniverseID: string;
}

export interface MoreMenuDispatchProperties {
    dispatchSetActiveUniverse: typeof actions.space.setActiveUniverse;
}

export type MoreMenuProperties = MoreMenuOwnProperties
    & MoreMenuStateProperties
    & MoreMenuDispatchProperties;


const MoreMenu: React.FC<MoreMenuProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** state */
        interactionTheme,
        documents,
        activeUniverseID,

        /** dispatch */
        dispatchSetActiveUniverse,
    } = properties;


    /** render */
    return (
        <StyledMoreMenu
            theme={interactionTheme}
        >
            <StyledMoreMenuScroll>
                <ul>
                    {
                        Object.keys(documents).map(documentID => {
                            const document = documents[documentID];
                            const active = documentID === activeUniverseID;

                            return (
                                <StyledMenuUniversesItemList
                                    key={documentID}
                                    theme={interactionTheme}
                                    onClick={() => !active ? dispatchSetActiveUniverse(documentID) : null}
                                    active={active}
                                >
                                    {document.name}
                                </StyledMenuUniversesItemList>
                            )
                        })
                    }
                </ul>
            </StyledMoreMenuScroll>
        </StyledMoreMenu>
    );
}


const mapStateToProps = (
    state: AppState,
): MoreMenuStateProperties => ({
    interactionTheme: selectors.themes.getInteractionTheme(state),
    documents: selectors.data.getUniverses(state),
    activeUniverseID: selectors.space.getActiveUniverseID(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): MoreMenuDispatchProperties => ({
    dispatchSetActiveUniverse: (
        documentID: string,
    ) => dispatch(
        actions.space.setActiveUniverse(documentID)
    )
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(MoreMenu);
