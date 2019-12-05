import React, {
    // useState,
    // useEffect,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    Indexed,
    PluridInternalStateDocument,
} from '@plurid/plurid-data';

import {
    StyledMoreMenu,
    // StyledMoreMenuItem,
    StyledMoreMenuScroll,
} from './styled';

import { AppState } from '../../../../../services/state/store';
import StateContext from '../../../../../services/state/context';
import selectors from '../../../../../services/state/selectors';
import actions from '../../../../../services/state/actions';



interface MoreMenuOwnProperties {
}

interface MoreMenuStateProperties {
    interactionTheme: Theme;
    documents: Indexed<PluridInternalStateDocument>;
}

interface MoreMenuDispatchProperties {
    dispatchSetActiveDocument: typeof actions.space.setActiveDocument;
}

type MoreMenuProperties = MoreMenuOwnProperties
    & MoreMenuStateProperties
    & MoreMenuDispatchProperties;

const MoreMenu: React.FC<MoreMenuProperties> = (properties) => {
    const {
        /** state */
        interactionTheme,
        documents,

        /** dispatch */
        dispatchSetActiveDocument,
    } = properties;

    return (
        <StyledMoreMenu
            theme={interactionTheme}
        >
            <StyledMoreMenuScroll>
                <ul>
                    {
                        Object.keys(documents).map(documentID => {
                            const document = documents[documentID];

                            return (
                                <li
                                    key={documentID}
                                    onClick={() => dispatchSetActiveDocument(documentID)}
                                >
                                    {document.name}
                                </li>
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
    documents: selectors.data.getDocuments(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): MoreMenuDispatchProperties => ({
    dispatchSetActiveDocument: (documentID: string) => dispatch(
        actions.space.setActiveDocument(documentID)
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
