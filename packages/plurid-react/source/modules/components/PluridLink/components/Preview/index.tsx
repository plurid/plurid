import React, {
    useContext,
} from 'react';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    PluridContext
} from '@plurid/plurid-data';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    StyledPreview,
} from './styled';

import Context from '../../../../services/logic/context';

import { AppState } from '../../../../services/state/store';
import StateContext from '../../../../services/state/context';
import selectors from '../../../../services/state/selectors';
// import actions from '../../../../services/state/actions';



interface PreviewOwnProperties {
    document: string | undefined;
    pageID: string;
    linkCoordinates: any;
}

interface PreviewStateProperties {
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
}

interface PreviewDispatchProperties {
}

type PreviewProperties = PreviewOwnProperties
    & PreviewStateProperties
    & PreviewDispatchProperties;

const Preview: React.FC<PreviewProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** own */
        document,
        pageID,
        linkCoordinates,

        /** state */
        stateGeneralTheme,
        // stateInteractionTheme,
    } = properties;


    /** context */
    const context: PluridContext = useContext(Context);

    const {
        documents,
    } = context;

    const documentID = document || 'default';
    const activeDocument = documents[documentID];
    const activePages = activeDocument.pages;
    const pluridPage = activePages[pageID];

    if (!pluridPage) {
        return (<></>);
    }

    const Element = pluridPage.component.element;


    /** render */
    return (
        <StyledPreview
            theme={stateGeneralTheme}
            linkCoordinates={linkCoordinates}
        >
            <Element
                plurid={{
                    parameters: {},
                    query: {},
                }}
            />
        </StyledPreview>
    );
}


const mapStateToProperties = (
    state: AppState,
): PreviewStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PreviewDispatchProperties => ({
});


export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(Preview);
