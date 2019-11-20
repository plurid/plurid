import React, {
    useEffect,
    useState,
    useCallback,
    useRef,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    PluridApp as PluridAppProperties,
    PluridConfiguration as PluridAppConfiguration,
    TreePage,
    defaultConfiguration,
} from '@plurid/plurid-data';

import PluridPubSub, {
    TOPICS,
} from '@plurid/plurid-pubsub'

import {
    debounce,
    uuidv4 as uuid,
} from '@plurid/plurid-functions';

import themes, {
    Theme,
    THEME_NAMES,
} from '@plurid/plurid-themes';

import {
    computeSpaceTree,
    computeSpaceLocation,
    recomputeSpaceTreeLocations,
} from '@plurid/plurid-engine';

import './index.css';

import {
    StyledView,
    GlobalStyle,
} from './styled';

import handleView from './logic';

import Context from '../../modules/services/utilities/context';

import {
    handleGlobalShortcuts,
    handleGlobalWheel,
} from '../../modules/services/logic/shortcuts';

import { AppState } from '../../modules/services/state/store';
import { ViewSize } from '../../modules/services/state/types/data';
import selectors from '../../modules/services/state/selectors';
import actions from '../../modules/services/state/actions';
import StateContext from '../../modules/services/state/context';



export interface ViewOwnProperties {
    appProperties: PluridAppProperties;
}

interface ViewStateProperties {
    spaceLoading: boolean;
    tree: TreePage[];
    viewSize: ViewSize;
    transform: any;
}

interface ViewDispatchProperties {
    dispatch: ThunkDispatch<{}, {}, AnyAction>;

    setConfiguration: typeof actions.configuration.setConfiguration;
    setMicro: typeof actions.configuration.setMicro;

    setPages: typeof actions.data.setPages;
    setDocuments: typeof actions.data.setDocuments;
    setViewSize: typeof actions.data.setViewSize;

    setSpaceLoading: typeof actions.space.setSpaceLoading;
    setSpaceLocation: typeof actions.space.setSpaceLocation;
    setTree: typeof actions.space.setTree;

    setGeneralTheme: typeof actions.themes.setGeneralTheme;
    setInteractionTheme: typeof actions.themes.setInteractionTheme;

    rotateXWith: typeof actions.space.rotateXWith;
    rotateYWith: typeof actions.space.rotateYWith;
    translateXWith: typeof actions.space.translateXWith;
    translateYWith: typeof actions.space.translateYWith;
}

type ViewProperties = ViewOwnProperties
    & ViewStateProperties
    & ViewDispatchProperties;

const View: React.FC<ViewProperties> = (properties) => {
    const viewElement = useRef<HTMLDivElement>(null);

    const {
        appProperties,

        spaceLoading,
        tree,
        viewSize,
        transform,

        dispatch,

        setConfiguration,
        setMicro,

        setPages,
        setDocuments,
        setViewSize,

        setSpaceLoading,
        setSpaceLocation,
        setTree,

        setGeneralTheme,
        setInteractionTheme,

        rotateXWith,
        rotateYWith,
        translateXWith,
        translateYWith,
    } = properties;

    const {
        configuration,
        pages,
        documents,
        pubsub,
    } = appProperties;

    const [eventListenersSet, setEventListenersSet] = useState(false);

    const shortcutsCallback = useCallback((event: KeyboardEvent) => {
        handleGlobalShortcuts(
            dispatch,
            event,
        );
    }, [
        dispatch,
    ]);

    const wheelCallback = useCallback((event: WheelEvent) => {
        handleGlobalWheel(
            dispatch,
            event,
        );
    }, [
        dispatch,
    ]);

    const handleConfiguration = (configuration: PluridAppConfiguration) => {
        setConfiguration(configuration);

        if (configuration.micro) {
            setMicro();
        }

        if (configuration.space) {
            const spaceLocation = computeSpaceLocation(configuration);
            setSpaceLocation(spaceLocation);
        }

        if (configuration.space.center && !configuration.space.camera) {
            const x = window.innerWidth / 2 - viewSize.width / 2 * configuration.planeWidth;
            translateXWith(x);

            // to get plane height;
            const planeHeight = 300;
            const y = window.innerHeight / 2 - planeHeight/2;
            translateYWith(y);
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

    const handlePubSubSubscribe = (pubsub: PluridPubSub) => {
        pubsub.subscribe(TOPICS.SPACE_ROTATE_X_WITH, (data: any) => {
            const {
                value,
            } = data;
            rotateXWith(value);
        });

        pubsub.subscribe(TOPICS.SPACE_ROTATE_Y_WITH, (data: any) => {
            const {
                value,
            } = data;
            rotateYWith(value);
        });
    }

    const handlePubSubPublish = (pubsub: PluridPubSub) => {
        pubsub.publish(TOPICS.SPACE_TRANSFORM, transform);
    }

    /** Keydown, Wheel Listeners */
    useEffect(() => {
        if (viewElement.current) {
            if (!eventListenersSet) {
                viewElement.current.addEventListener(
                    'keydown',
                    shortcutsCallback,
                    {
                        passive: false,
                    },
                );
                viewElement.current.addEventListener(
                    'wheel',
                    wheelCallback,
                    {
                        passive: false,
                    },
                );
                setEventListenersSet(true);
            }
        }
    }, [
        viewElement.current,
    ]);

    /** Resize Listener */
    useEffect(() => {
        const handleResize = debounce(() => {
            if (viewElement && viewElement.current) {
                setViewSize({
                    height: viewElement.current.offsetHeight,
                    width: viewElement.current.offsetWidth,
                });
                const recomputedTree = recomputeSpaceTreeLocations(tree);
                setTree(recomputedTree);
            }
        }, 150);

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, [tree]);

    /** Configuration, Pages, Documents */
    useEffect(() => {
        const mergedConfiguration = { ...defaultConfiguration, ...configuration };

        handleConfiguration(mergedConfiguration);

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

        if (viewElement && viewElement.current) {
            setViewSize({
                height: viewElement.current.offsetHeight,
                width: viewElement.current.offsetWidth,
            });
        }

        if (_pages) {
            const computedTree = computeSpaceTree(_pages, mergedConfiguration);
            setTree(computedTree);
        }

        setSpaceLoading(false);
    }, [
        configuration,
        pubsub,
    ]);

    /** PubSub Subscription */
    useEffect(() => {
        if (pubsub) {
            handlePubSubSubscribe(pubsub);
        }
    }, [
        pubsub,
    ])

    /** PubSub Publish */
    useEffect(() => {
        if (pubsub) {
            handlePubSubPublish(pubsub);
        }
    }, [
        transform,
    ]);

    const viewContainer = handleView(pages, documents);

    return (
        <StyledView
            ref={viewElement}
            tabIndex={0}
        >
            {!spaceLoading && (
                <>
                    <GlobalStyle />

                    <Context.Provider
                        value={{
                            pages: pages || [],
                            pageContext: appProperties.pageContext,
                            pageContextValue: appProperties.pageContextValue,
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
    viewSize: selectors.data.getViewSize(state),
    transform: selectors.space.getTransform(state),
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): ViewDispatchProperties => ({
    dispatch,

    setConfiguration: (configuration: PluridAppConfiguration) => dispatch(actions.configuration.setConfiguration(configuration)),
    setMicro: () => dispatch(actions.configuration.setMicro()),

    setPages: (pages: any) => dispatch(actions.data.setPages(pages)),
    setDocuments: (documents: any) => dispatch(actions.data.setDocuments(documents)),
    setViewSize: (viewSize: ViewSize) => dispatch(actions.data.setViewSize(viewSize)),

    setSpaceLoading: (loading: boolean) => dispatch(actions.space.setSpaceLoading(loading)),
    setSpaceLocation: (spaceLocation: any) => dispatch(actions.space.setSpaceLocation(spaceLocation)),
    setTree: (tree: TreePage[]) => dispatch(actions.space.setTree(tree)),

    setGeneralTheme: (theme: Theme) => dispatch(actions.themes.setGeneralTheme(theme)),
    setInteractionTheme: (theme: Theme) => dispatch(actions.themes.setInteractionTheme(theme)),

    rotateXWith: (value: number) => dispatch(actions.space.rotateXWith(value)),
    rotateYWith: (value: number) => dispatch(actions.space.rotateYWith(value)),
    translateXWith: (value: number) => dispatch(actions.space.translateXWith(value)),
    translateYWith: (value: number) => dispatch(actions.space.translateYWith(value)),
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(View);
