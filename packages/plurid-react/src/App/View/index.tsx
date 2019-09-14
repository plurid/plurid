import React, {
    useEffect,
    useCallback,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    PluridApp as PluridAppProperties,
    PluridConfiguration as PluridAppConfiguration,
    TreePage,
} from '@plurid/plurid-data';

import {
    debounce,
    uuidv4 as uuid,
} from '@plurid/apps.utilities.functions';

import themes, {
    Theme,
    THEME_NAMES,
} from '@plurid/apps.utilities.themes';

import './index.css';

import {
    StyledView,
    GlobalStyle,
} from './styled';

import handleView from './logic';

import Context from '../../modules/services/utilities/context';

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
    computeSpaceLocation,
    recomputeSpaceTreeLocations,
} from '../../modules/services/logic/space';

import { AppState } from '../../modules/services/state/store';
import { ViewSize } from '../../modules/services/state/types/data';
import selectors from '../../modules/services/state/selectors';
import actions from '../../modules/services/state/actions';



export interface ViewOwnProperties {
    appProperties: PluridAppProperties;
}

interface ViewStateProperties {
    spaceLoading: boolean;
    tree: TreePage[];
}

interface ViewDispatchProperties {
    dispatch: ThunkDispatch<{}, {}, AnyAction>;

    setConfiguration: typeof actions.configuration.setConfiguration;

    setPages: typeof actions.data.setPages;
    setDocuments: typeof actions.data.setDocuments;
    setViewSize: typeof actions.data.setViewSize;

    setSpaceLoading: typeof actions.space.setSpaceLoading;
    setSpaceLocation: typeof actions.space.setSpaceLocation;
    setTree: typeof actions.space.setTree;

    setGeneralTheme: typeof actions.themes.setGeneralTheme;
    setInteractionTheme: typeof actions.themes.setInteractionTheme;
}

type ViewProperties = ViewOwnProperties
    & ViewStateProperties
    & ViewDispatchProperties;

const View: React.FC<ViewProperties> = (properties) => {
    const {
        appProperties,

        spaceLoading,
        tree,

        dispatch,

        setConfiguration,

        setPages,
        setDocuments,
        setViewSize,

        setSpaceLoading,
        setSpaceLocation,
        setTree,

        setGeneralTheme,
        setInteractionTheme,
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

    const handleConfiguration = (configuration: PluridAppConfiguration) => {
        setConfiguration(configuration);

        if (configuration.roots) {
            const spaceLocation = computeSpaceLocation(configuration);
            setSpaceLocation(spaceLocation);
        }

        if (configuration.theme) {
            if (typeof configuration.theme === 'object') {
                const {
                    general,
                    interaction,
                } = configuration.theme;

                if (general) {
                    if (Object.keys(THEME_NAMES).includes(general)) {
                        setGeneralTheme(themes[general]);
                    }
                }

                if (interaction) {
                    if (Object.keys(THEME_NAMES).includes(interaction)) {
                        setInteractionTheme(themes[interaction]);
                    }
                }
            } else {
                if (Object.keys(THEME_NAMES).includes(configuration.theme)) {
                    setGeneralTheme(themes[configuration.theme]);
                    setInteractionTheme(themes[configuration.theme]);
                }
            }
        }
    }

    useEffect(() => {
        if (configuration) {
            handleConfiguration(configuration);
        }

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
        }

        setSpaceLoading(false);
    }, [configuration]);

    const viewContainer = handleView(pages, documents);

    return (
        <StyledView>
            {!spaceLoading && (
                <>
                    <GlobalStyle />

                    <Context.Provider
                        value={{
                            pages: pages || [],
                            documents: documents || [],
                        }}
                    >
                        {viewContainer}
                    </Context.Provider>
                </>
            )}
        </StyledView>
    );
}


const mapStateToProps = (state: AppState): ViewStateProperties => ({
    spaceLoading: selectors.space.getLoading(state),
    tree: selectors.space.getTree(state),
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): ViewDispatchProperties => ({
    dispatch,

    setConfiguration: (configuration: PluridAppConfiguration) => dispatch(actions.configuration.setConfiguration(configuration)),

    setPages: (pages: any) => dispatch(actions.data.setPages(pages)),
    setDocuments: (documents: any) => dispatch(actions.data.setDocuments(documents)),
    setViewSize: (viewSize: ViewSize) => dispatch(actions.data.setViewSize(viewSize)),

    setSpaceLoading: (loading: boolean) => dispatch(actions.space.setSpaceLoading(loading)),
    setSpaceLocation: (spaceLocation: any) => dispatch(actions.space.setSpaceLocation(spaceLocation)),
    setTree: (tree: TreePage[]) => dispatch(actions.space.setTree(tree)),

    setGeneralTheme: (theme: Theme) => dispatch(actions.themes.setGeneralTheme(theme)),
    setInteractionTheme: (theme: Theme) => dispatch(actions.themes.setInteractionTheme(theme)),
});


export default connect(mapStateToProps, mapDispatchToProps)(View);
