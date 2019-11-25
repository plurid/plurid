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
    Tree,
    TreePage,
    PluridContext,
    PluridDocument,
    PluridPage,
    Indexed,
    PluridInternalStateDocument,
    PluridInternalContextDocument,
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
    tree: Tree;
    viewSize: ViewSize;
    transform: any;
    dataDocuments: Indexed<PluridInternalStateDocument>;
    activeDocumentID: string;
}

interface ViewDispatchProperties {
    dispatch: ThunkDispatch<{}, {}, AnyAction>;

    setConfiguration: typeof actions.configuration.setConfiguration;
    setMicro: typeof actions.configuration.setMicro;

    setPages: typeof actions.data.setPages;
    dispatchSetDocuments: typeof actions.data.setDocuments;
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

    dispatchSetActiveDocument: typeof actions.space.setActiveDocument;
}

type ViewProperties = ViewOwnProperties
    & ViewStateProperties
    & ViewDispatchProperties;

const View: React.FC<ViewProperties> = (properties) => {
    const viewElement = useRef<HTMLDivElement>(null);

    const {
        /** own */
        appProperties,

        /** state */
        spaceLoading,
        tree,
        viewSize,
        transform,
        dataDocuments,
        activeDocumentID,

        /** dispatch */
        dispatch,

        setConfiguration,
        setMicro,

        setPages,
        dispatchSetDocuments,
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

        dispatchSetActiveDocument,
    } = properties;

    const {
        configuration,
        pages,
        documents,
        pubsub,
    } = appProperties;

    const [eventListenersSet, setEventListenersSet] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const [contextDocuments, setContextDocuments] = useState<Indexed<PluridInternalContextDocument>>({});

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
    // useEffect(() => {
    //     const handleResize = debounce(() => {
    //         if (viewElement && viewElement.current) {
    //             setViewSize({
    //                 height: viewElement.current.offsetHeight,
    //                 width: viewElement.current.offsetWidth,
    //             });
    //             const recomputedTree = recomputeSpaceTreeLocations(tree);
    //             setTree(recomputedTree);
    //         }
    //     }, 150);

    //     window.addEventListener('resize', handleResize);

    //     return () => {
    //         window.removeEventListener('resize', handleResize);
    //     }
    // }, [
    //     tree,
    // ]);

    /** Pages, Documents */
    useEffect(() => {
        if (!documents && pages) {
            // create a document and add pages to it
            const documentPages: Indexed<PluridPage> = {};
            const contextPages = {};

            pages.map(page => {
                const id = page.id || uuid();
                const _page = {
                    ...page,
                    id,
                };
                contextPages[id] = {
                    ..._page,
                };
                delete _page.component;
                documentPages[id] = {
                    ..._page,
                };
            });

            const document: PluridDocument = {
                id: 'default',
                name: 'default',
                pages: documentPages,
            };

            const documents = {
                default: document,
            };

            const contextDocument = {
                id: 'default',
                name: 'default',
                pages: contextPages,
            };
            const contextDocuments = {
                default: contextDocument,
            }
            setContextDocuments(contextDocuments);

            dispatchSetDocuments(documents);
            dispatchSetActiveDocument('default');

            // if (_pages) {
            //     const computedTree = computeSpaceTree(_pages, mergedConfiguration);
            //     setTree(computedTree);
            // }
        }

        if (documents) {
            // create multiple documents
        }

        // if (viewElement && viewElement.current) {
        //     setViewSize({
        //         height: viewElement.current.offsetHeight,
        //         width: viewElement.current.offsetWidth,
        //     });
        // }
    }, [
        pages,
        documents,
    ]);

    /** Configuration, Pages, Documents */
    useEffect(() => {
        const mergedConfiguration = { ...defaultConfiguration, ...configuration };

        if (!initialized) {
            handleConfiguration(mergedConfiguration);
            setInitialized(true);
        }

        setSpaceLoading(false);
    }, [
        configuration,
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

    useEffect(() => {
        const activeDocument = dataDocuments[activeDocumentID];
        const pages = activeDocument.pages;

        // compute tree
    }, [
        activeDocumentID,
        dataDocuments,
    ]);

    const viewContainer = handleView(pages, documents);

    const pluridContext: PluridContext = {
        pageContext: appProperties.pageContext,
        pageContextValue: appProperties.pageContextValue,
        documents: contextDocuments,
    };

    return (
        <StyledView
            ref={viewElement}
            tabIndex={0}
        >
            {!spaceLoading && (
                <>
                    <GlobalStyle />

                    <Context.Provider
                        value={pluridContext}
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
    dataDocuments: selectors.data.getDocuments(state),
    activeDocumentID: selectors.space.getActiveDocumentID(state),
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): ViewDispatchProperties => ({
    dispatch,

    setConfiguration: (configuration: PluridAppConfiguration) => dispatch(actions.configuration.setConfiguration(configuration)),
    setMicro: () => dispatch(actions.configuration.setMicro()),

    setPages: (pages: any) => dispatch(actions.data.setPages(pages)),
    dispatchSetDocuments: (documents: any) => dispatch(
        actions.data.setDocuments(documents)
    ),
    setViewSize: (viewSize: ViewSize) => dispatch(actions.data.setViewSize(viewSize)),

    setSpaceLoading: (loading: boolean) => dispatch(actions.space.setSpaceLoading(loading)),
    setSpaceLocation: (spaceLocation: any) => dispatch(actions.space.setSpaceLocation(spaceLocation)),
    setTree: (tree: Tree) => dispatch(actions.space.setTree(tree)),

    setGeneralTheme: (theme: Theme) => dispatch(actions.themes.setGeneralTheme(theme)),
    setInteractionTheme: (theme: Theme) => dispatch(actions.themes.setInteractionTheme(theme)),

    rotateXWith: (value: number) => dispatch(actions.space.rotateXWith(value)),
    rotateYWith: (value: number) => dispatch(actions.space.rotateYWith(value)),
    translateXWith: (value: number) => dispatch(actions.space.translateXWith(value)),
    translateYWith: (value: number) => dispatch(actions.space.translateYWith(value)),

    dispatchSetActiveDocument: (activeDocument: string) => dispatch(
        actions.space.setActiveDocument(activeDocument)
    ),
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(View);
