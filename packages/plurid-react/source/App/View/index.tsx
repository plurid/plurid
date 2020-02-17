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
    /** enumerations */
    TRANSFORM_MODES,
    TRANSFORM_TOUCHES,

    /** interfaces */
    PluridApp as PluridAppProperties,
    PluridConfiguration as PluridAppConfiguration,
    Indexed,
    PluridContext,
    TreePage,
    PluridInternalStateDocument,
    PluridInternalContextDocument,
} from '@plurid/plurid-data';

import PluridPubSub, {
    TOPICS,
} from '@plurid/plurid-pubsub'

import {
    meta,
} from '@plurid/plurid-functions';

import themes, {
    Theme,
    THEME_NAMES,
} from '@plurid/plurid-themes';

import {
    space,
} from '@plurid/plurid-engine';

import './index.css';

import {
    StyledView,
    GlobalStyle,
} from './styled';

import handleView from './logic';

import Context from '../../modules/services/logic/context';

import * as helpers from '../../modules/services/logic/helpers';

import {
    createInternalStateDocument,
    createInternalContextDocument,
    findActiveDocument,
} from '../../modules/services/logic/documents';

import {
    createInternalStatePage,
    createInternalContextPage,
} from '../../modules/services/logic/pages';

import {
    createTreePage,
} from '../../modules/services/logic/tree';

import {
    registerPaths,
} from '../../modules/services/logic/paths';

import mergeConfiguration from '../../modules/services/logic/configuration';

import {
    handleGlobalShortcuts,
    handleGlobalWheel,
} from '../../modules/services/logic/shortcuts';

import {
    useDebouncedCallback,
} from '../../modules/services/hooks/debounce';

import { AppState } from '../../modules/services/state/store';
import selectors from '../../modules/services/state/selectors';
import actions from '../../modules/services/state/actions';
import StateContext from '../../modules/services/state/context';
import {
    ViewSize,
} from '../../modules/services/state/types/space';
import {
    SpaceSize,
} from '../../modules/services/state/modules/space/types';



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
}

interface ViewDispatchProperties {
    dispatch: ThunkDispatch<{}, {}, AnyAction>;

    dispatchSetConfiguration: typeof actions.configuration.setConfiguration;
    dispatchSetConfigurationMicro: typeof actions.configuration.setConfigurationMicro;

    dispatchSetDocuments: typeof actions.data.setDocuments;

    dispatchSetViewSize: typeof actions.space.setViewSize;
    dispatchSetSpaceLoading: typeof actions.space.setSpaceLoading;
    dispatchSetAnimatedTransform: typeof actions.space.setAnimatedTransform;
    dispatchSetSpaceLocation: typeof actions.space.setSpaceLocation;
    dispatchSetTree: typeof actions.space.setTree;
    dispatchSetSpaceSize: typeof actions.space.setSpaceSize;

    dispatchSetGeneralTheme: typeof actions.themes.setGeneralTheme;
    dispatchSetInteractionTheme: typeof actions.themes.setInteractionTheme;

    rotateXWith: typeof actions.space.rotateXWith;
    rotateYWith: typeof actions.space.rotateYWith;
    translateXWith: typeof actions.space.translateXWith;
    translateYWith: typeof actions.space.translateYWith;
    scaleUpWith: typeof actions.space.scaleUpWith;
    scaleDownWith: typeof actions.space.scaleDownWith;

    dispatchSetActiveDocument: typeof actions.space.setActiveDocument;

    dispatchSpaceSetView: typeof actions.space.spaceSetView;
}

type ViewProperties = ViewOwnProperties
    & ViewStateProperties
    & ViewDispatchProperties;

const View: React.FC<ViewProperties> = (
    properties,
) => {
    /** properties */
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


        /** dispatch */
        dispatch,

        dispatchSetConfiguration,
        dispatchSetConfigurationMicro,

        dispatchSetDocuments,
        dispatchSetViewSize,

        dispatchSetSpaceLoading,
        dispatchSetAnimatedTransform,
        dispatchSetSpaceLocation,
        dispatchSetTree,
        dispatchSetSpaceSize,

        dispatchSetGeneralTheme,
        dispatchSetInteractionTheme,

        rotateXWith,
        rotateYWith,
        translateXWith,
        translateYWith,
        scaleUpWith,
        scaleDownWith,

        dispatchSetActiveDocument,

        dispatchSpaceSetView,
    } = properties;

    const {
        configuration,
        pages,
        view,
        documents,
        pubsub,
    } = appProperties;


    /** references */
    const viewElement = useRef<HTMLDivElement>(null);

    const contextDocumentsRef = useRef<Indexed<PluridInternalContextDocument>>({});


    /** state */
    const [initialized, setInitialized] = useState(false);

    // const [contextDocuments, setContextDocuments] = useState<Indexed<PluridInternalContextDocument>>({});


    /** callbacks */
    const shortcutsCallback = useCallback((event: KeyboardEvent) => {
        const {
            transformLocks,
        } = stateConfiguration.space;

        handleGlobalShortcuts(
            dispatch,
            event,
            stateConfiguration.space.firstPerson,
            transformLocks,
        );
    }, [
        stateConfiguration.space.firstPerson,
        stateConfiguration.space.transformLocks,
        dispatch,
    ]);

    const wheelCallback = useCallback((event: WheelEvent) => {
        const {
            transformMode,
            transformLocks,
        } = stateConfiguration.space;

        const transformModes = {
            rotation: transformMode === TRANSFORM_MODES.ROTATION,
            translation: transformMode === TRANSFORM_MODES.TRANSLATION,
            scale: transformMode === TRANSFORM_MODES.SCALE,
        };

        handleGlobalWheel(
            dispatch,
            event,
            transformModes,
            transformLocks,
        );
    }, [
        dispatch,
        stateConfiguration.space.transformMode,
        stateConfiguration.space.transformLocks,
    ]);


    /** handlers */
    const handleConfiguration = (
        configuration: PluridAppConfiguration,
    ) => {
        dispatchSetConfiguration(configuration);

        if (configuration.micro) {
            dispatchSetConfigurationMicro();
        }

        if (configuration.space) {
            const spaceLocation = space.computeSpaceLocation(configuration);
            dispatchSetSpaceLocation(spaceLocation);
        }

        if (configuration.space.center && !configuration.space.camera) {
            const x = window.innerWidth / 2 - viewSize.width / 2 * configuration.elements.plane.width;
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
            transformMode,
        } = stateConfiguration.space;

        const {
            velocity,
            distance,
            direction,
        } = event;

        if (transformMode === TRANSFORM_MODES.ALL) {
            return;
        }

        const rotationMode = transformMode === TRANSFORM_MODES.ROTATION;
        const translationMode = transformMode === TRANSFORM_MODES.TRANSLATION;
        const scalationMode = transformMode === TRANSFORM_MODES.SCALE;

        dispatchSetAnimatedTransform(true);
        switch (direction) {
            case 2:
                /** right */
                if (rotationMode) {
                    rotateYWith(velocity * 60);
                }

                if (translationMode) {
                    translateXWith(-1 * distance);
                }
                break;
            case 4:
                /** left */
                if (rotationMode) {
                    rotateYWith(velocity * 60);
                }

                if (translationMode) {
                    translateXWith(distance);
                }
                break;
            case 8:
                /** top */
                if (rotationMode) {
                    rotateXWith(velocity * 60);
                }

                if (translationMode) {
                    translateYWith(-1 * distance);
                }

                if (scalationMode) {
                    scaleUpWith(velocity);
                }
                break;
            case 16:
                /** down */
                if (rotationMode) {
                    rotateXWith(velocity * 60);
                }

                if (translationMode) {
                    translateYWith(distance);
                }

                if (scalationMode) {
                    scaleDownWith(velocity);
                }
                break;
        }
        setTimeout(() => {
            dispatchSetAnimatedTransform(false);
        }, 450);
    }

    const handlePan = (
        event: HammerInput,
    ) => {
        const {
            transformMode,
        } = stateConfiguration.space;

        const {
            velocity,
            distance,
            direction,
        } = event;

        if (transformMode === TRANSFORM_MODES.ALL) {
            return;
        }

        const rotationMode = transformMode === TRANSFORM_MODES.ROTATION;
        const translationMode = transformMode === TRANSFORM_MODES.TRANSLATION;
        const scalationMode = transformMode === TRANSFORM_MODES.SCALE;

        const rotationVelocity = velocity * 20;
        const translationVelocity = distance / 5;
        const scaleVelocity = velocity / 4;

        switch (direction) {
            case 2:
                /** right */
                if (rotationMode) {
                    rotateYWith(rotationVelocity);
                }

                if (translationMode) {
                    translateXWith(-1 * translationVelocity);
                }
                break;
            case 4:
                /** left */
                if (rotationMode) {
                    rotateYWith(rotationVelocity);
                }

                if (translationMode) {
                    translateXWith(translationVelocity);
                }
                break;
            case 8:
                /** top */
                if (rotationMode) {
                    rotateXWith(rotationVelocity);
                }

                if (translationMode) {
                    translateYWith(-1 * translationVelocity);
                }

                if (scalationMode) {
                    scaleUpWith(scaleVelocity);
                }
                break;
            case 16:
                /** down */
                if (rotationMode) {
                    rotateXWith(rotationVelocity);
                }

                if (translationMode) {
                    translateYWith(translationVelocity);
                }

                if (scalationMode) {
                    scaleDownWith(scaleVelocity);
                }
                break;
        }
    }

    const centerSpaceSize = useDebouncedCallback((
        spaceSize: any,
    ) => {
        const x = - spaceSize.width / 2 + window.innerWidth / 2;
        const y = - spaceSize.height / 2 + window.innerHeight / 2;

        if (!initialized) {
            dispatchSetAnimatedTransform(true);
            translateXWith(x);
            translateYWith(y);
            setTimeout(() => {
                dispatchSetAnimatedTransform(false);
            }, 450);
        }
    }, 100);

    const computeTree = (
        tree: TreePage[],
    ) => {
        // const computedTree = computeSpaceTree(
        //     tree,
        //     stateConfiguration,
        //     view,
        // );
        // dispatchSetTree(computedTree);
    }


    /** effects */
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
        stateConfiguration.space.transformMode,
        stateConfiguration.space.firstPerson,
    ]);

    /** Resize Listener */
    useEffect(() => {
        const handleResize = meta.debounce(() => {
            if (viewElement && viewElement.current) {
                const width = viewElement.current.offsetWidth;
                const height = viewElement.current.offsetHeight;
                dispatchSetViewSize({
                    width,
                    height,
                });
            }
        }, 150);

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, []);

    /** Set View Size */
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

    /** View Size Listener */
    useEffect(() => {
        computeTree(tree);
    }, [
        viewSize,
    ]);

    /** Pages, Documents */
    useEffect(() => {
        if (!documents && pages) {
            const identifiedPages = helpers.identifyPages(pages);

            const statePages = identifiedPages.map(page => {
                const statePage = createInternalStatePage(page);
                return statePage;
            });

            const contextPages = identifiedPages.map(page => {
                const contextPage = createInternalContextPage(page);
                return contextPage;
            });

            const indexedStatePages = helpers.createIndexed(statePages);
            const indexedContextPages = helpers.createIndexed(contextPages);

            const paths = registerPaths(statePages);
            const indexedPaths = helpers.createIndexed(paths);

            const document: PluridInternalStateDocument = {
                id: 'default',
                name: 'default',
                pages: indexedStatePages,
                paths: indexedPaths,
                ordinal: 0,
                active: true,
            };

            const documents = {
                default: document,
            };

            const contextDocument = {
                id: 'default',
                name: 'default',
                pages: indexedContextPages,
            };
            contextDocumentsRef.current = {
                default: contextDocument,
            };
            dispatchSetDocuments(documents);

            dispatchSetActiveDocument('default');
        }

        if (documents) {
            const identifiedDocuments = helpers.identifyDocuments(documents);

            const stateDocuments = identifiedDocuments.map(document => {
                const stateDocument = createInternalStateDocument(document);
                return stateDocument;
            });
            const contextDocuments = identifiedDocuments.map(document => {
                const contextDocument = createInternalContextDocument(document);
                return contextDocument;
            });

            const indexedStateDocuments = helpers.createIndexed(stateDocuments);
            const indexedContextDocuments = helpers.createIndexed(contextDocuments);

            contextDocumentsRef.current = {...indexedContextDocuments};
            dispatchSetDocuments(indexedStateDocuments);

            const activeDocumentID = findActiveDocument(stateDocuments);
            dispatchSetActiveDocument(activeDocumentID);
        }
    }, [
        pages,
        documents,
    ]);

    /** Configuration */
    useEffect(() => {
        const mergedConfiguration = mergeConfiguration(configuration);

        // if (!initialized) {
            handleConfiguration(mergedConfiguration);
        //     setInitialized(true);
        // }

        dispatchSetSpaceLoading(false);
    }, [
        configuration,
    ]);

    /** State Configuration Layout */
    useEffect(() => {
        computeTree(tree);
    }, [
        stateConfiguration.space.layout,
    ]);

    /** PubSub Subscription */
    useEffect(() => {
        if (pubsub) {
            handlePubSubSubscribe(pubsub);
        }
    }, [
        pubsub,
    ]);

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
        if (activeDocumentID && contextDocumentsRef.current) {
            const activeDocument = dataDocuments[activeDocumentID];
            const pages = activeDocument.pages;

            // console.log('pages', pages);

            const activeContextDocument = contextDocumentsRef.current[activeDocumentID];
            const contextPages = activeContextDocument.pages;

            const treePages: TreePage[] = [];
            for (const pageID in pages) {
                const docPage = pages[pageID]

                // if (docPage.root) {
                    const contextPage = contextPages[pageID];
                    if (!contextPage) {
                        continue;
                    }

                    const treePage = createTreePage(
                        contextPage,
                        docPage,
                    );
                    treePages.push(treePage);
                // }
            }

            // console.log('treePages', treePages);

            const computedTree = space.computeSpaceTree(
                treePages,
                stateConfiguration,
                view,
            );
            // console.log('computedTree', computedTree);
            dispatchSetTree(computedTree);
        }
    }, [
        activeDocumentID,
        dataDocuments,
        contextDocumentsRef.current,
    ]);

    /** Touch */
    useEffect(() => {
        const {
            transformTouch,
        } = stateConfiguration.space;

        /**
         * Remove Hammerjs default css properties to add them only when in Lock Mode.
         * https://stackoverflow.com/a/37896547
         */
        delete Hammer.defaults.cssProps.userSelect;
        delete Hammer.defaults.cssProps.userDrag;
        delete Hammer.defaults.cssProps.tapHighlightColor;
        delete Hammer.defaults.cssProps.touchSelect;

        const touch = new Hammer((viewElement as any).current);
        touch.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        touch.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

        if (transformTouch === TRANSFORM_TOUCHES.PAN) {
            touch.on('pan', handlePan);
        } else {
            touch.on('swipe', handleSwipe);
        }

        return () => {
            if (transformTouch === TRANSFORM_TOUCHES.PAN) {
                touch.off('pan', handlePan);
            } else {
                touch.off('swipe', handleSwipe);
            }
        }
    }, [
        viewElement.current,
        stateConfiguration.space.transformTouch,
    ]);

    /** Space Size */
    useEffect(() => {
        const spaceSize = space.computeSpaceSize(tree);

        dispatchSetSpaceSize(spaceSize);
        // centerSpaceSize(spaceSize);
    }, [
        tree,
    ]);

    /** Handle View */
    useEffect(() => {
        if (view) {
            dispatchSpaceSetView(view);
        }
    }, [
        view,
    ]);


    /** context */
    const pluridContext: PluridContext = {
        pageContext: appProperties.pageContext,
        pageContextValue: appProperties.pageContextValue,
        documents: contextDocumentsRef.current,
    };
    // console.log('pluridContext', pluridContext);
    // console.log('dataDocuments', dataDocuments);
    // console.log('Rendered Plurid View');


    /** render */
    const viewContainer = handleView(pages, documents);

    return (
        <StyledView
            ref={viewElement}
            tabIndex={0}
            transformMode={stateConfiguration.space.transformMode}
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
    viewSize: selectors.space.getViewSize(state),
    transform: selectors.space.getTransform(state),
    tree: selectors.space.getTree(state),
    activeDocumentID: selectors.space.getActiveDocumentID(state),
    spaceLoading: selectors.space.getLoading(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): ViewDispatchProperties => ({
    dispatch,

    dispatchSetConfiguration: (configuration: PluridAppConfiguration) => dispatch(
        actions.configuration.setConfiguration(configuration)
    ),
    dispatchSetConfigurationMicro: () => dispatch(
        actions.configuration.setConfigurationMicro()
    ),

    dispatchSetDocuments: (documents: any) => dispatch(
        actions.data.setDocuments(documents)
    ),
    dispatchSetViewSize: (viewSize: ViewSize) => dispatch(
        actions.space.setViewSize(viewSize)
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
    dispatchSetSpaceSize: (payload: SpaceSize) => dispatch(
        actions.space.setSpaceSize(payload)
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

    dispatchSpaceSetView: (
        view,
    ) => dispatch(
        actions.space.spaceSetView(view),
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
