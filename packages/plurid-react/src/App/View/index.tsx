import React, {
    useEffect,
    useCallback,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import './index.css';

import {
    StyledView,
    GlobalStyle,
} from './styled';

import handleView from './logic';

import {
    PluridAppProperties,
    TreePage,
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
    computeCameraLocationX,
    recomputeSpaceTreeLocations,
} from '../../modules/services/logic/space';

import { AppState } from '../../modules/services/state/store';
import selectors from '../../modules/services/state/selectors';
import actions from '../../modules/services/state/actions';
import { ViewSize } from '../../modules/services/state/types/data';

// import themes from '@plurid/apps.utilities.themes';




export interface ViewOwnProperties {
    appProperties: PluridAppProperties;
}

interface ViewStateProperties {
    tree: TreePage[];
}

interface ViewDispatchProperties {
    dispatch: ThunkDispatch<{}, {}, AnyAction>;
    setConfiguration: typeof actions.configuration.setConfiguration;
    setPages: typeof actions.data.setPages;
    setDocuments: typeof actions.data.setDocuments;
    setViewSize: typeof actions.data.setViewSize;
    setTree: typeof actions.space.setTree;
    setSpaceLocation: typeof actions.space.setSpaceLocation;
}

type ViewProperties = ViewStateProperties & ViewDispatchProperties & ViewOwnProperties;

const View: React.FC<ViewProperties> = (properties) => {
    const {
        appProperties,

        tree,

        dispatch,
        setConfiguration,
        setPages,
        setDocuments,
        setViewSize,
        setTree,
        setSpaceLocation,
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

            const recomputedTree = recomputeSpaceTreeLocations(tree);
            setTree(recomputedTree);
        }, 150);

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, [tree]);

    useEffect(() => {
        setConfiguration(configuration);

        const _pages = pages && pages.map(page => {
            const id = uuid();
            const _page = { ...page, id };
            delete _page.component;
            return _page;
        }) || [];
        setPages(_pages);

        const _documents = documents && documents.map(document => {
            const _documentPages = document.pages.map(documentPage => {
                const _page = { ...documentPage };
                delete _page.component;
                return _page;
            });
            return { ...document, pages: _documentPages};
        }) || [];
        setDocuments(_documents);

        if (_pages) {
            const computedTree = computeSpaceTree(_pages, configuration);
            setTree(computedTree);

            if (configuration && configuration.roots) {
                const cameraLocationX = computeCameraLocationX(configuration);
                const spaceLocation = {
                    rotationX: 0,
                    rotationY: 0,
                    translationX: cameraLocationX,
                    translationY: 0,
                    translationZ: 0,
                    scale: 1,
                };
                console.log(spaceLocation);
                setSpaceLocation(spaceLocation);
            }
        }
    }, [configuration]);

    const viewContainer = handleView(pages, documents);

    return (
        <StyledView>
            <GlobalStyle />

            <Context.Provider
                value={{
                    pages: pages || [],
                    documents: documents || [],
                }}
            >
                {viewContainer}
            </Context.Provider>
        </StyledView>
    );
}


const mapStateToProps = (state: AppState): ViewStateProperties => ({
    tree: selectors.space.getTree(state),
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): ViewDispatchProperties => ({
    dispatch,
    setConfiguration: (configuration: any) => dispatch(actions.configuration.setConfiguration(configuration)),
    setPages: (pages: any) => dispatch(actions.data.setPages(pages)),
    setDocuments: (documents: any) => dispatch(actions.data.setDocuments(documents)),
    setViewSize: (viewSize: ViewSize) => dispatch(actions.data.setViewSize(viewSize)),
    setTree: (tree: TreePage[]) => dispatch(actions.space.setTree(tree)),
    setSpaceLocation: (spaceLocation: any) => dispatch(actions.space.setSpaceLocation(spaceLocation)),
});


export default connect(mapStateToProps, mapDispatchToProps)(View);
