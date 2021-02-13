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
        Indexed,
        PluridInternalStateUniverse,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    import actions from '~services/state/actions';
    // #endregion external


    // #region internal
    import {
        StyledPluridMenuUniverses,
        // StyledPluridMenuUniversesItem,
        StyledPluridMenuUniversesScroll,
        StyledMenuUniversesItemList,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridMenuUniversesOwnProperties {
}

export interface PluridMenuUniversesStateProperties {
    interactionTheme: Theme;
    // documents: Indexed<PluridInternalStateUniverse>;
    activeUniverseID: string;
}

export interface PluridMenuUniversesDispatchProperties {
    dispatchSetActiveUniverse: typeof actions.space.setActiveUniverse;
}

export type PluridMenuUniversesProperties = PluridMenuUniversesOwnProperties
    & PluridMenuUniversesStateProperties
    & PluridMenuUniversesDispatchProperties;


const PluridMenuUniverses: React.FC<PluridMenuUniversesProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** state */
        interactionTheme,
        // documents,
        activeUniverseID,

        /** dispatch */
        dispatchSetActiveUniverse,
    } = properties;


    /** render */
    return (
        <StyledPluridMenuUniverses
            theme={interactionTheme}
        >
            <StyledPluridMenuUniversesScroll>
                {/* <ul>
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
                </ul> */}
            </StyledPluridMenuUniversesScroll>
        </StyledPluridMenuUniverses>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridMenuUniversesStateProperties => ({
    interactionTheme: selectors.themes.getInteractionTheme(state),
    // documents: selectors.data.getUniverses(state),
    activeUniverseID: selectors.space.getActiveUniverseID(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): PluridMenuUniversesDispatchProperties => ({
    dispatchSetActiveUniverse: (
        documentID: string,
    ) => dispatch(
        actions.space.setActiveUniverse(documentID)
    )
});


const ConnectedPluridMenuUniverses = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridMenuUniverses);
// #endregion module



// #region exports
export default ConnectedPluridMenuUniverses;
// #endregion exports
