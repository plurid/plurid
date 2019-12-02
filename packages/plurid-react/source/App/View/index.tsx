import React, {
    useEffect,
    useState,
    useCallback,
    useRef,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import Hammer from 'hammerjs';

import {
    /** constants */
    defaultConfiguration,

    /** enumerations */
    SIZES,

    /** interfaces */
    PluridApp as PluridAppProperties,
    PluridConfiguration as PluridAppConfiguration,
    Indexed,
    PluridDocument,
    PluridPage,
    PluridContext,
    TreePage,
    PluridInternalStatePage,
    PluridInternalStateDocument,
    PluridInternalContextPage,
    PluridInternalContextDocument,
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
    configuration: PluridAppConfiguration;
    dataDocuments: Indexed<PluridInternalStateDocument>;
    viewSize: ViewSize;
    spaceLoading: boolean;
    transform: any;
    tree: TreePage[];
    activeDocumentID: string;
    rotationLocked: boolean;
    translationLocked: boolean;
    scaleLocked: boolean;
    firstPerson: boolean;
}

interface ViewDispatchProperties {
    dispatch: ThunkDispatch<{}, {}, AnyAction>;

    dispatchSetConfiguration: typeof actions.configuration.setConfiguration;
    dispatchSetMicro: typeof actions.configuration.setMicro;
    dispatchSetConfigurationPlaneControls: typeof actions.configuration.setConfigurationPlaneControls;

    dispatchSetDocuments: typeof actions.data.setDocuments;
    dispatchSetViewSize: typeof actions.data.setViewSize;

    dispatchSetSpaceLoading: typeof actions.space.setSpaceLoading;
    dispatchSetAnimatedTransform: typeof actions.space.setAnimatedTransform;
    dispatchSetSpaceLocation: typeof actions.space.setSpaceLocation;
    dispatchSetTree: typeof actions.space.setTree;

    dispatchSetGeneralTheme: typeof actions.themes.setGeneralTheme;
    dispatchSetInteractionTheme: typeof actions.themes.setInteractionTheme;

    rotateXWith: typeof actions.space.rotateXWith;
    rotateYWith: typeof actions.space.rotateYWith;
    translateXWith: typeof actions.space.translateXWith;
    translateYWith: typeof actions.space.translateYWith;
    scaleUpWith: typeof actions.space.scaleUpWith;
    scaleDownWith: typeof actions.space.scaleDownWith;

    dispatchSetActiveDocument: typeof actions.space.setActiveDocument;

    dispatchToggleShowTransformOrigin: typeof actions.space.toggleShowTransformOrigin;
    dispatchSetTransformOriginSize: typeof actions.space.setTransformOriginSize;
}

type ViewProperties = ViewOwnProperties
    & ViewStateProperties
    & ViewDispatchProperties;

const View: React.FC<ViewProperties> = (properties) => {
    const viewElement = useRef<HTMLDivElement>(null);

    const contextDocumentsRef = useRef<Indexed<PluridInternalContextDocument>>({});

    const {
        /** own */
        appProperties,

        /** state */
        configuration: stateConfiguration,
        spaceLoading,
        tree,
        viewSize,
        transform,
        dataDocuments,
        activeDocumentID,

        rotationLocked,
        translationLocked,
        scaleLocked,
        firstPerson,


        /** dispatch */
        dispatch,

        dispatchSetConfiguration,
        dispatchSetMicro,
        dispatchSetConfigurationPlaneControls,

        dispatchSetDocuments,
        dispatchSetViewSize,

        dispatchSetSpaceLoading,
        dispatchSetAnimatedTransform,
        dispatchSetSpaceLocation,
        dispatchSetTree,

        dispatchSetGeneralTheme,
        dispatchSetInteractionTheme,

        rotateXWith,
        rotateYWith,
        translateXWith,
        translateYWith,
        scaleUpWith,
        scaleDownWith,

        dispatchSetActiveDocument,

        dispatchToggleShowTransformOrigin,
        dispatchSetTransformOriginSize,
    } = properties;

    const {
        configuration,
        pages,
        documents,
        pubsub,
    } = appProperties;

    const [initialized, setInitialized] = useState(false);

    // const [contextDocuments, setContextDocuments] = useState<Indexed<PluridInternalContextDocument>>({});

    const shortcutsCallback = useCallback((event: KeyboardEvent) => {
        handleGlobalShortcuts(
            dispatch,
            event,
            firstPerson,
        );
    }, [
        firstPerson,
        dispatch,
    ]);

    const wheelCallback = useCallback((event: WheelEvent) => {
        const locks = {
            rotation: rotationLocked,
            translation: translationLocked,
            scale: scaleLocked,
        };

        handleGlobalWheel(
            dispatch,
            event,
            locks,
        );
    }, [
        dispatch,
        rotationLocked,
        translationLocked,
        scaleLocked,
    ]);

    const handleConfiguration = (
        configuration: PluridAppConfiguration,
    ) => {
        dispatchSetConfiguration(configuration);

        // if (configuration.micro) {
        //     dispatchSetMicro();
        // }

        if (configuration.planeControls) {
            dispatchSetConfigurationPlaneControls(true);
        } else {
            dispatchSetConfigurationPlaneControls(false);
        }

        if (configuration.space) {
            const spaceLocation = computeSpaceLocation(configuration);
            dispatchSetSpaceLocation(spaceLocation);

            if (!configuration.space.showTransformOrigin) {
                dispatchToggleShowTransformOrigin();
            }

            if (configuration.space.transformOriginSize) {
                dispatchSetTransformOriginSize(configuration.space.transformOriginSize);
            }
        }

        // if (configuration.space.center && !configuration.space.camera) {
        //     const x = window.innerWidth / 2 - viewSize.width / 2 * configuration.planeWidth;
        //     translateXWith(x);

        //     // to get plane height;
        //     const planeHeight = 300;
        //     const y = window.innerHeight / 2 - planeHeight/2;
        //     translateYWith(y);
        // }

        if (configuration.theme) {
            if (typeof configuration.theme === 'object') {
                const {
                    general,
                    interaction,
                } = configuration.theme;

                if (general) {
                    if (Object.keys(THEME_NAMES).includes(general)) {
                        dispatchSetGeneralTheme(themes[general]);
                    }
                }

                if (interaction) {
                    if (Object.keys(THEME_NAMES).includes(interaction)) {
                        dispatchSetInteractionTheme(themes[interaction]);
                    }
                }
            } else {
                if (Object.keys(THEME_NAMES).includes(configuration.theme)) {
                    dispatchSetGeneralTheme(themes[configuration.theme]);
                    dispatchSetInteractionTheme(themes[configuration.theme]);
                }
            }
        }
    }

    const handlePubSubSubscribe = (
        pubsub: PluridPubSub,
    ) => {
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

    const handlePubSubPublish = (
        pubsub: PluridPubSub,
    ) => {
        pubsub.publish(TOPICS.SPACE_TRANSFORM, transform);

        pubsub.publish(TOPICS.CONFIGURATION, stateConfiguration);
    }

    const handleSwipe = (
        event: HammerInput,
    ) => {
        const {
            velocity,
            distance,
            direction,
        } = event;

        dispatchSetAnimatedTransform(true);
        switch (direction) {
            case 2:
                /** right */
                if (rotationLocked) {
                    rotateYWith(velocity * 60);
                }

                if (translationLocked) {
                    translateXWith(-1 * distance);
                }
                break;
            case 4:
                /** left */
                if (rotationLocked) {
                    rotateYWith(velocity * 60);
                }

                if (translationLocked) {
                    translateXWith(distance);
                }
                break;
            case 8:
                /** top */
                if (rotationLocked) {
                    rotateXWith(velocity * 60);
                }

                if (translationLocked) {
                    translateYWith(-1 * distance);
                }

                if (scaleLocked) {
                    scaleUpWith(velocity);
                }
                break;
            case 16:
                /** down */
                if (rotationLocked) {
                    rotateXWith(velocity * 60);
                }

                if (translationLocked) {
                    translateYWith(distance);
                }

                if (scaleLocked) {
                    scaleDownWith(velocity);
                }
                break;
        }
        setTimeout(() => {
            dispatchSetAnimatedTransform(false);
        }, 450);
    }

    const generatePluridContext = (
        documents: PluridDocument[] | undefined,
        pages: PluridPage[] | undefined,
    ): PluridContext => {
        const documentPages: Indexed<PluridInternalStatePage> = {};
        const contextPages: Indexed<PluridInternalContextPage> = {};

        if (!documents && pages) {
            pages.map(page => {
                const id = page.id || uuid();

                const contextPage = {
                    ...page,
                    id,
                };
                contextPages[id] = {
                    ...contextPage,
                };

                const documentPage: PluridInternalStatePage = {
                    root: page.root || false,
                    ordinal: page.ordinal || 0,
                    id,
                    path: page.path,
                };
                documentPages[id] = {
                    ...documentPage,
                };
            });

            const document: PluridInternalStateDocument = {
                id: 'default',
                name: 'default',
                pages: documentPages,
                ordinal: 0,
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
            // setContextDocuments(contextDocuments);
            contextDocumentsRef.current = {...contextDocuments};

            dispatchSetDocuments(documents);
            dispatchSetActiveDocument('default');

            const pluridContext: PluridContext = {
                pageContext: appProperties.pageContext,
                pageContextValue: appProperties.pageContextValue,
                documents: contextDocuments,
            };
            return pluridContext;
        }

        contextDocumentsRef.current = {};
        const pluridContext: PluridContext = {
            pageContext: appProperties.pageContext,
            pageContextValue: appProperties.pageContextValue,
            documents: {},
        };
        return pluridContext;
    }

    /** Keydown, Wheel Listeners */
    useEffect(() => {
        if (viewElement.current) {
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
        }

        return () => {
            if (viewElement.current) {
                viewElement.current.removeEventListener(
                    'keydown',
                    shortcutsCallback,
                );
                viewElement.current.removeEventListener(
                    'wheel',
                    wheelCallback,
                );
            }
        }
    }, [
        viewElement.current,
        rotationLocked,
        translationLocked,
        scaleLocked,
        firstPerson,
    ]);

    /** Resize Listener */
    useEffect(() => {
        const handleResize = debounce(() => {
            if (viewElement && viewElement.current) {
                const width = viewElement.current.offsetWidth;
                const height = viewElement.current.offsetHeight;
                dispatchSetViewSize({
                    width,
                    height,
                });

                const recomputedTree = recomputeSpaceTreeLocations(tree);
                dispatchSetTree(recomputedTree);
            }
        }, 150);

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, [
        tree,
    ]);

    /** Pages, Documents */
    useEffect(() => {
        if (!documents && pages) {
            const documentPages: Indexed<PluridInternalStatePage> = {};
            const contextPages: Indexed<PluridInternalContextPage> = {};

            pages.map(page => {
                const id = page.id || uuid();

                const contextPage = {
                    ...page,
                    id,
                };
                contextPages[id] = {
                    ...contextPage,
                };

                const documentPage: PluridInternalStatePage = {
                    root: page.root || false,
                    ordinal: page.ordinal || 0,
                    id,
                    path: page.path,
                };
                documentPages[id] = {
                    ...documentPage,
                };
            });

            const document: PluridInternalStateDocument = {
                id: 'default',
                name: 'default',
                pages: documentPages,
                ordinal: 0,
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
            // setContextDocuments(contextDocuments);
            contextDocumentsRef.current = {...contextDocuments};

            dispatchSetDocuments(documents);
            dispatchSetActiveDocument('default');
        }

        if (documents) {
            // create multiple documents
        }
    }, [
        pages,
        documents,
    ]);

    /** View Size */
    useEffect(() => {
        if (viewElement && viewElement.current) {
            const width = viewElement.current.offsetWidth;
            const height = viewElement.current.offsetHeight;
            if (width && height) {
                dispatchSetViewSize({
                    height: viewElement.current.offsetHeight,
                    width: viewElement.current.offsetWidth,
                });
            }
        }
    }, [
        viewElement.current,
    ]);

    /** Configuration */
    useEffect(() => {
        const mergedConfiguration: PluridAppConfiguration = {
            theme: {
                general: configuration && typeof configuration.theme === 'string'
                    ? configuration.theme
                    : configuration && typeof configuration.theme === 'object'
                        ? configuration.theme.general
                        : typeof defaultConfiguration.theme === 'object'
                            ? defaultConfiguration.theme.general
                            : 'plurid',
                interaction: configuration && typeof configuration.theme === 'string'
                    ? configuration.theme
                    : configuration && typeof configuration.theme === 'object'
                        ? configuration.theme.general
                        : typeof defaultConfiguration.theme === 'object'
                            ? defaultConfiguration.theme.general
                            : 'plurid',
            },
            micro: configuration && typeof configuration.micro === 'boolean'
                ? configuration.micro
                : defaultConfiguration.micro,
            toolbar: configuration && typeof configuration.toolbar === 'boolean'
                ? configuration.toolbar
                : defaultConfiguration.toolbar,
            viewcube: configuration && typeof configuration.viewcube === 'boolean'
                ? configuration.viewcube
                : defaultConfiguration.viewcube,
            planeControls: configuration && typeof configuration.planeControls === 'boolean'
                ? configuration.planeControls
                : defaultConfiguration.planeControls,
            planeDomainURL: configuration && configuration.planeDomainURL
                ? configuration.planeDomainURL
                : defaultConfiguration.planeDomainURL,
            planeWidth: configuration && typeof configuration.planeWidth === 'number'
                ? configuration.planeWidth
                : defaultConfiguration.planeWidth,
            planeOpacity: configuration && typeof configuration.planeOpacity === 'number'
                ? configuration.planeOpacity
                : defaultConfiguration.planeOpacity,
            space: {
                layout: configuration && configuration.space && configuration.space.layout
                    ? configuration.space.layout
                    : defaultConfiguration.space.layout,
                camera: configuration && configuration.space && configuration.space.camera
                    ? configuration.space.camera
                    : defaultConfiguration.space.camera,
                perspective: configuration && configuration.space && configuration.space.perspective
                    ? configuration.space.perspective
                    : defaultConfiguration.space.perspective,
                transparent: configuration && configuration.space && typeof configuration.space.transparent === 'boolean'
                    ? configuration.space.transparent
                    : defaultConfiguration.space.transparent,
                center: configuration && configuration.space && typeof configuration.space.center === 'boolean'
                    ? configuration.space.center
                    : defaultConfiguration.space.center,
                showTransformOrigin: configuration && configuration.space && typeof configuration.space.showTransformOrigin === 'boolean'
                    ? configuration.space.showTransformOrigin
                    : defaultConfiguration.space.showTransformOrigin,
                transformOriginSize: configuration && configuration.space && configuration.space.transformOriginSize
                    ? configuration.space.transformOriginSize
                    : defaultConfiguration.space.transformOriginSize,
            },
            ui: {
                toolbar: {
                    hide: configuration && configuration.ui && configuration.ui.toolbar && typeof configuration.ui.toolbar.hide === 'boolean'
                        ? configuration.ui.toolbar.hide
                        : defaultConfiguration.ui.toolbar.hide,
                    alwaysShowIcons: configuration && configuration.ui && configuration.ui.toolbar && typeof configuration.ui.toolbar.alwaysShowIcons === 'boolean'
                        ? configuration.ui.toolbar.alwaysShowIcons
                        : defaultConfiguration.ui.toolbar.alwaysShowIcons,
                    alwaysShowTransformButtons: configuration && configuration.ui && configuration.ui.toolbar && typeof configuration.ui.toolbar.alwaysShowTransformButtons === 'boolean'
                        ? configuration.ui.toolbar.alwaysShowTransformButtons
                        : defaultConfiguration.ui.toolbar.alwaysShowTransformButtons,
                },
                viewcube: {
                    transparent: configuration && configuration.ui && configuration.ui.viewcube && typeof configuration.ui.viewcube.transparent === 'boolean'
                        ? configuration.ui.viewcube.transparent
                        : defaultConfiguration.ui.viewcube.transparent,
                },
            },
        };

        if (!initialized) {
            handleConfiguration(mergedConfiguration);
            setInitialized(true);
        }

        dispatchSetSpaceLoading(false);
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
        stateConfiguration,
        transform,
    ]);

    /** Handle Tree */
    useEffect(() => {
        if (activeDocumentID) {
            const activeDocument = dataDocuments[activeDocumentID];
            console.log('activeDocument', activeDocument);
            const pages = activeDocument.pages;

            const activeContextDocument = contextDocumentsRef.current[activeDocumentID];
            const contextPages = activeContextDocument.pages;

            const treePages: TreePage[] = [];
            for (const pageID in pages) {
                const docPage = pages[pageID]

                const contextPage = contextPages[pageID];
                const treePage: TreePage = {
                    pageID: contextPage.id,
                    planeID: uuid(),
                    path: contextPage.path,
                    location: {
                        translateX: 0,
                        translateY: 0,
                        translateZ: 0,
                        rotateX: 0,
                        rotateY: 0,
                    },
                    show: docPage.root,
                };

                if (docPage.root) {
                    treePages.push(treePage);
                }
            }

            const computedTree = computeSpaceTree(treePages, stateConfiguration);
            dispatchSetTree(computedTree);
        }
    }, [
        // stateConfiguration,
        activeDocumentID,
        dataDocuments,
        contextDocumentsRef.current,
    ]);

    /** Touch */
    useEffect(() => {
        /**
         * Remove Hammerjs default css properties to add them only when in Lock Mode.
         * https://stackoverflow.com/a/37896547
         */
        delete Hammer.defaults.cssProps.userSelect;
        delete Hammer.defaults.cssProps.userDrag;
        delete Hammer.defaults.cssProps.tapHighlightColor;

        const touch = new Hammer((viewElement as any).current);
        touch.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

        touch.on('swipe', handleSwipe);

        return () => {
            touch.off('swipe', handleSwipe);
        }
    }, [
        viewElement.current,
        rotationLocked,
        translationLocked,
        scaleLocked,
    ]);

    const viewContainer = handleView(pages, documents);

    // const pluridContext = generatePluridContext(
    //     documents,
    //     pages,
    // );
    // console.log('appProperties', appProperties);

    // console.log('contextDocumentsRef.current', contextDocumentsRef.current);
    const pluridContext: PluridContext = {
        pageContext: appProperties.pageContext,
        pageContextValue: appProperties.pageContextValue,
        documents: contextDocumentsRef.current,
    };
    // console.log('pluridContext', pluridContext);

    return (
        <StyledView
            ref={viewElement}
            tabIndex={0}
            lockMode={rotationLocked || scaleLocked || translationLocked}
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


const mapStateToProperties = (
    state: AppState,
): ViewStateProperties => ({
    configuration: selectors.configuration.getConfiguration(state),
    dataDocuments: selectors.data.getDocuments(state),
    viewSize: selectors.data.getViewSize(state),
    transform: selectors.space.getTransform(state),
    tree: selectors.space.getTree(state),
    activeDocumentID: selectors.space.getActiveDocumentID(state),
    spaceLoading: selectors.space.getLoading(state),
    rotationLocked: selectors.space.getRotationLocked(state),
    translationLocked: selectors.space.getTranslationLocked(state),
    scaleLocked: selectors.space.getScaleLocked(state),
    firstPerson: selectors.space.getFirstPerson(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): ViewDispatchProperties => ({
    dispatch,

    dispatchSetConfiguration: (configuration: PluridAppConfiguration) => dispatch(
        actions.configuration.setConfiguration(configuration)
    ),
    dispatchSetMicro: () => dispatch(
        actions.configuration.setMicro()
    ),
    dispatchSetConfigurationPlaneControls: (value: boolean) => dispatch(
        actions.configuration.setConfigurationPlaneControls(value)
    ),

    dispatchSetDocuments: (documents: any) => dispatch(
        actions.data.setDocuments(documents)
    ),
    dispatchSetViewSize: (viewSize: ViewSize) => dispatch(
        actions.data.setViewSize(viewSize)
    ),

    dispatchSetSpaceLoading: (loading: boolean) => dispatch(
        actions.space.setSpaceLoading(loading)
    ),
    dispatchSetAnimatedTransform: (animated: boolean) => dispatch(
        actions.space.setAnimatedTransform(animated)
    ),
    dispatchSetSpaceLocation: (spaceLocation: any) => dispatch(
        actions.space.setSpaceLocation(spaceLocation)
    ),
    dispatchSetTree: (tree: TreePage[]) => dispatch(
        actions.space.setTree(tree)
    ),

    dispatchSetGeneralTheme: (theme: Theme) => dispatch(
        actions.themes.setGeneralTheme(theme)
    ),
    dispatchSetInteractionTheme: (theme: Theme) => dispatch(
        actions.themes.setInteractionTheme(theme)
    ),

    rotateXWith: (value: number) => dispatch(
        actions.space.rotateXWith(value)
    ),
    rotateYWith: (value: number) => dispatch(
        actions.space.rotateYWith(value)
    ),
    translateXWith: (value: number) => dispatch(
        actions.space.translateXWith(value)
    ),
    translateYWith: (value: number) => dispatch(
        actions.space.translateYWith(value)
    ),
    scaleUpWith: (value: number) => dispatch(
        actions.space.scaleUpWith(value)
    ),
    scaleDownWith: (value: number) => dispatch(
        actions.space.scaleDownWith(value)
    ),

    dispatchSetActiveDocument: (activeDocument: string) => dispatch(
        actions.space.setActiveDocument(activeDocument)
    ),

    dispatchToggleShowTransformOrigin: () => dispatch(
        actions.space.toggleShowTransformOrigin()
    ),
    dispatchSetTransformOriginSize: (size: keyof typeof SIZES) => dispatch(
        actions.space.setTransformOriginSize(size)
    ),
});


export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(View);
