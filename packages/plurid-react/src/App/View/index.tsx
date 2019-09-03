import React, {
    // useState,
    useEffect,
    useCallback,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    StyledView,
    GlobalStyle,
} from './styled';

import handleView from './logic';

import {
    PluridAppProperties,
} from '../../modules/data/interfaces';

import Context from './context';

import { debounce } from '../../modules/services/utilities/debounce';
import uuid from '../../modules/services/utilities/uuid';

import {
    useGlobalKeyDown,
    useGlobalWheel,
} from '../../modules/services/hooks';

import {
    handleGlobalShortcuts,
    handleGlobalWheel,
} from '../../modules/services/logic/shortcuts';

import {
    computeSpaceTree,
} from '../../modules/services/logic/space';

import { AppState } from '../../modules/services/state/store';
// import selectors from '../../modules/services/state/selectors';
import actions from '../../modules/services/state/actions';
import { ViewSize } from '../../modules/services/state/types/data';

// import themes from '@plurid/apps.utilities.themes';




export interface ViewOwnProperties {
    appProperties: PluridAppProperties;
}

interface ViewStateProperties {
}

interface ViewDispatchProperties {
    dispatch: ThunkDispatch<{}, {}, AnyAction>;
    setConfiguration: typeof actions.configuration.setConfiguration;
    setPages: typeof actions.data.setPages;
    setDocuments: typeof actions.data.setDocuments;
    setViewSize: typeof actions.data.setViewSize;
}

type ViewProperties = ViewStateProperties & ViewDispatchProperties & ViewOwnProperties;

const View: React.FC<ViewProperties> = (properties) => {
    const {
        appProperties,
        setConfiguration,
        setPages,
        setDocuments,
        setViewSize,
        dispatch,
    } = properties;

    const {
        configuration,
        pages,
        documents,
    } = appProperties;

    const shortcutsCallback = useCallback((event: KeyboardEvent) => {
        handleGlobalShortcuts(dispatch, event);
    }, [dispatch]);
    useGlobalKeyDown((shortcutsCallback));

    const wheelCallback = useCallback((event: WheelEvent) => {
        handleGlobalWheel(dispatch, event);
    }, [dispatch]);
    useGlobalWheel(wheelCallback);

    useEffect(() => {
        const handleResize = debounce(() => {
            setViewSize({
                height: window.innerHeight,
                width: window.innerWidth,
            });
        }, 1500);

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        }
    });

    useEffect(() => {
        setConfiguration(configuration);

        // to store the pages and documents in context
        // and to keep in redux only the paths and the rest of the metadata
        // console.log(pages);

        const _pages = pages && pages.map(page => {
            const id = uuid();
            const _page = { ...page, id };
            delete _page.component;
            return _page;
        }) || [];
        // console.log(_pages);
        setPages(_pages);

        const _documents = documents && documents.map(document => {
            const _documentPages = document.pages.map(documentPage => {
                const _page = { ...documentPage };
                delete _page.component;
                return _page;
            });
            return { ...document, pages: _documentPages};
        }) || [];
        // console.log(_documents);
        setDocuments(_documents);

        // compute space tree based on pages
        if (_pages) {
            computeSpaceTree(dispatch, _pages);
        }
    }, [configuration, dispatch]);

    const viewContainer = handleView(pages, documents);

    return (
        <StyledView>
            <GlobalStyle />

            <Context.Provider
                value={{
                    pages,
                    documents
                }}
            >
                {viewContainer}
            </Context.Provider>
        </StyledView>
    );
}


const mapStateToProps = (state: AppState): ViewStateProperties => ({
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): ViewDispatchProperties => ({
    dispatch,
    setConfiguration: (configuration: any) => dispatch(actions.configuration.setConfiguration(configuration)),
    setPages: (pages: any) => dispatch(actions.data.setPages(pages)),
    setDocuments: (documents: any) => dispatch(actions.data.setDocuments(documents)),
    setViewSize: (viewSize: ViewSize) => dispatch(actions.data.setViewSize(viewSize)),
});


export default connect(mapStateToProps, mapDispatchToProps)(View);
