import React, {
    useRef,
    // useState,
    useCallback,
    useEffect,
} from 'react';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    /** constants */
    PLURID_ENTITY_VIEW,

    /** enumerations */
    TRANSFORM_MODES,
    TRANSFORM_TOUCHES,

    /** interfaces */
    PluridApplication as PluridApplicationProperties,
    PluridConfiguration as PluridAppConfiguration,
    PluridPartialConfiguration,
    PluridContext,
    PluridPlane,
    PluridView,
    PluridCluster,
    PluridUniverse,
    TreePlane,
    PluridInternalStateUniverse,
    PluridInternalContextUniverse,
    Indexed,
} from '@plurid/plurid-data';

import {
    space,
    general as generalEngine,
} from '@plurid/plurid-engine';

import PluridPubSub, {
    TOPICS,
} from '@plurid/plurid-pubsub';

// import {
//     meta,
//     arrays,
// } from '@plurid/plurid-functions';

// import {
//     useDebouncedCallback,
//     useThrottledCallback,
// } from '@plurid/plurid-functions-react';

import themes, {
    Theme,
    THEME_NAMES,
} from '@plurid/plurid-themes';

import './index.css';

import {
    StyledView,
    GlobalStyle,
} from './styled';

import handleView from './logic';

import Context from '../../modules/services/logic/context';

// import * as helpers from '../../modules/services/logic/helpers';

// import {
//     createInternalStateUniverse,
//     createInternalContextUniverse,
//     findActiveUniverse,
// } from '../../modules/services/logic/universes';

// import {
//     createInternalStatePlane,
//     createInternalContextPlane,
// } from '../../modules/services/logic/planes';

// import {
//     createTreePlane,
// } from '../../modules/services/logic/tree';

// import {
//     registerPaths,
// } from '../../modules/services/logic/paths';

import {
    handleGlobalShortcuts,
    handleGlobalWheel,
} from '../../modules/services/logic/shortcuts';

import {
    loadHammer,
} from '../../modules/services/utilities/imports';

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



export interface HandledUniverses {
    stateUniverses: Indexed<PluridInternalStateUniverse>;
    contextUniverses: Indexed<PluridInternalContextUniverse>;
}


export interface ViewOwnProperties {
    appProperties: PluridApplicationProperties;
}

interface ViewStateProperties {
    configuration: PluridAppConfiguration;
    stateDataUniverses: Indexed<PluridInternalStateUniverse>;
    viewSize: ViewSize;
    spaceLoading: boolean;
    transform: any;
    initialTree: TreePlane[];
    stateTree: TreePlane[];
    activeUniverseID: string;
    stateSpaceLocation: any;
    stateCulledView: any;
}

interface ViewDispatchProperties {
    dispatch: ThunkDispatch<{}, {}, AnyAction>;

    dispatchSetConfiguration: typeof actions.configuration.setConfiguration;
    dispatchSetConfigurationMicro: typeof actions.configuration.setConfigurationMicro;

    dispatchSetUniverses: typeof actions.data.setUniverses;

    dispatchSetViewSize: typeof actions.space.setViewSize;
    dispatchSetSpaceLoading: typeof actions.space.setSpaceLoading;
    dispatchSetAnimatedTransform: typeof actions.space.setAnimatedTransform;
    dispatchSetSpaceLocation: typeof actions.space.setSpaceLocation;
    dispatchSetInitialTree: typeof actions.space.setInitialTree;
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

    dispatchSetActiveUniverse: typeof actions.space.setActiveUniverse;

    dispatchSpaceSetView: typeof actions.space.spaceSetView;
    dispatchSpaceSetCulledView: typeof actions.space.spaceSetCulledView;

    dispatchDataSetPlaneSources: typeof actions.data.setPlaneSources;
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
        initialTree,
        stateTree,
        viewSize,
        transform,
        stateDataUniverses,
        activeUniverseID,
        stateSpaceLocation,
        stateCulledView,

        /** dispatch */
        dispatch,

        dispatchSetConfiguration,
        dispatchSetConfigurationMicro,

        dispatchSetUniverses,
        dispatchSetViewSize,

        dispatchSetSpaceLoading,
        dispatchSetAnimatedTransform,
        dispatchSetSpaceLocation,
        dispatchSetInitialTree,
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

        dispatchSetActiveUniverse,

        dispatchSpaceSetView,
        dispatchSpaceSetCulledView,

        dispatchDataSetPlaneSources,
    } = properties;

    const {
        configuration,
        planes,
        indexedPlanes,
        view,
        clusters,
        universes,
        pubsub,
    } = appProperties;


    /** references */
    const viewElement = useRef<HTMLDivElement>(null);

    const contextUniversesRef = useRef<Indexed<PluridInternalContextUniverse>>({});


    // /** state */
    // const [initialized, setInitialized] = useState(false);


    // /** callbacks */
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


    // /** handlers */
    const handlePlanes = (
        planes: PluridPlane[],
        stateUniverses: Indexed<PluridInternalStateUniverse>,
    ) => {
        const identifiedPlanes = generalEngine.helpers.identifyPlanes(planes);

        const statePlanes = identifiedPlanes.map(plane => {
            const statePlane = generalEngine.planes.createInternalStatePlane(plane);
            return statePlane;
        });

        const contextPlanes = identifiedPlanes.map(plane => {
            const contextPlane = generalEngine.planes.createInternalContextPlane(plane);
            return contextPlane;
        });

        const indexedStatePlanes = generalEngine.helpers.createIndexed(statePlanes);
        const indexedContextPlanes = generalEngine.helpers.createIndexed(contextPlanes);

        const paths = generalEngine.paths.registerPaths(statePlanes);
        const indexedPaths = generalEngine.helpers.createIndexed(paths);

        const document: PluridInternalStateUniverse = {
            id: 'default',
            name: 'default',
            planes: indexedStatePlanes,
            paths: indexedPaths,
            ordinal: 0,
            active: true,
        };
        const indexedStateUniverses: Indexed<PluridInternalStateUniverse> = {
            default: document,
        };

        const contextUniverse = {
            id: 'default',
            name: 'default',
            planes: indexedContextPlanes,
        };
        const indexedContextUniverses: Indexed<PluridInternalContextUniverse> = {
            default: contextUniverse,
        };

        return {
            stateUniverses: indexedStateUniverses,
            contextUniverses: indexedContextUniverses,
        };
    }

    const handleUniverses = (
        universes: PluridUniverse[],
        stateUniverses: Indexed<PluridInternalStateUniverse>,
    ) => {
        const identifiedUniverses = generalEngine.helpers.identifyUniverses(universes);

        const identifiedStateUniverses = identifiedUniverses.map(document => {
            const stateUniverse = generalEngine.universes.createInternalStateUniverse(document);
            return stateUniverse;
        });
        const identifiedContextUniverses = identifiedUniverses.map(document => {
            const contextUniverse = generalEngine.universes.createInternalContextUniverse(document);
            return contextUniverse;
        });

        const indexedStateUniverses = generalEngine.helpers.createIndexed(identifiedStateUniverses);
        const indexedContextUniverses = generalEngine.helpers.createIndexed(identifiedContextUniverses);

        return {
            stateUniverses: indexedStateUniverses,
            contextUniverses: indexedContextUniverses,
        };
    }

    const createUniverses = (
        planes: PluridPlane[] | undefined,
        universes: PluridUniverse[] | undefined,
        stateUniverses: Indexed<PluridInternalStateUniverse>,
    ): HandledUniverses | undefined => {
        // To check against already loaded planes and universes
        // and update only the changes
        if (!universes && planes) {
            return handlePlanes(
                planes,
                stateUniverses,
            );
        }

        if (universes) {
            return handleUniverses(
                universes,
                stateUniverses,
            );
        }

        return;
    }

    const computeTree = (
        activeUniverseID: string,
        universes: Indexed<PluridInternalStateUniverse>,
        configuration: PluridAppConfiguration,
        view: string[] | PluridView[] | undefined,
        clusters: PluridCluster[] | undefined,
        contextUniverses: Indexed<PluridInternalContextUniverse>,
        previousTree: TreePlane[],
    ) => {
        const activeUniverse = universes[activeUniverseID];
        const planes = activeUniverse.planes;

        const activeContextUniverse = contextUniverses[activeUniverseID];
        const contextPlanes = activeContextUniverse.planes;

        const treePlanes: TreePlane[] = [];
        for (const planeID in planes) {
            const docPlane = planes[planeID]
            const contextPlane = contextPlanes[planeID];
            if (!contextPlane) {
                continue;
            }

            const treePlane = generalEngine.tree.createTreePlane(
                contextPlane,
                docPlane,
            );
            // console.log('treePlane', treePlane);
            treePlanes.push(treePlane);
        }

        // console.log('treePlanes', treePlanes);
        // console.log('view', view);

        const spaceTree = new space.tree.Tree({
            planes: treePlanes,
            configuration,
            view,
        });
        // console.log('spaceTree', spaceTree);

        const computedTree = spaceTree.compute();
        // console.log('computedTree', computedTree);

        return computedTree;
    }


    const computeApplication = (
        configuration: PluridPartialConfiguration | undefined,
        planes: PluridPlane[] | undefined,
        view: string[] | PluridView[] | undefined,
        clusters: PluridCluster[] | undefined,
        universes: PluridUniverse[] | undefined,
    ) => {
        /** computing */

        // merge user and default configuration
        const appConfiguration = generalEngine.configuration.default(configuration);

        handleConfiguration(appConfiguration);

        // create internal universes
        const createdUniverses = createUniverses(
            planes,
            universes,
            stateDataUniverses,
        );
        // console.log('createdUniverses', createdUniverses);

        if (!createdUniverses) {
            return;
        }

        const {
            stateUniverses,
            contextUniverses,
        } = createdUniverses;

        const activeUniverse = generalEngine.universes.findActiveUniverse(Object.values(stateUniverses));

        const newTree = computeTree(
            activeUniverse,
            stateUniverses,
            appConfiguration,
            view,
            clusters,
            contextUniverses,
            stateTree,
        );
        // console.log('newTree', newTree);

        const spaceSize = space.utilities.computeSpaceSize(newTree);


        /** assignments */
        contextUniversesRef.current = contextUniverses;

        dispatchSetSpaceSize(spaceSize);
        dispatchSetUniverses(stateUniverses);
        dispatchSetActiveUniverse(activeUniverse);
        dispatchSetConfiguration(appConfiguration);
        dispatchSetInitialTree(newTree);
        dispatchSetTree(newTree);
        dispatchSetSpaceLoading(false);
    }

    const handleConfiguration = (
        configuration: PluridAppConfiguration,
    ) => {
        if (configuration.micro) {
            dispatchSetConfigurationMicro();
        }

        if (configuration.theme) {
            if (typeof configuration.theme === 'object') {
                const {
                    general,
                    interaction,
                } = configuration.theme;

                if (general) {
                    if (Object.keys(THEME_NAMES).includes(general)) {
                        dispatchSetGeneralTheme((themes as any)[general]);
                    }
                }

                if (interaction) {
                    if (Object.keys(THEME_NAMES).includes(interaction)) {
                        dispatchSetInteractionTheme((themes as any)[interaction]);
                    }
                }
            } else {
                if (Object.keys(THEME_NAMES).includes(configuration.theme)) {
                    dispatchSetGeneralTheme((themes as any)[configuration.theme]);
                    dispatchSetInteractionTheme((themes as any)[configuration.theme]);
                }
            }
        }

        // if (configuration.space) {
        //     const spaceLocation = space.computeSpaceLocation(configuration);
        //     dispatchSetSpaceLocation(spaceLocation);
        // }

        // if (configuration.space.center && !configuration.space.camera) {
        //     const x = window.innerWidth / 2 - viewSize.width / 2 * configuration.elements.plane.width;
        //     translateXWith(x);

        //     // to get plane height;
        //     const planeHeight = 300;
        //     const y = window.innerHeight / 2 - planeHeight/2;
        //     translateYWith(y);
        // }
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

    // const centerSpaceSize = useDebouncedCallback((
    //     spaceSize: any,
    // ) => {
    //     const x = - spaceSize.width / 2 + window.innerWidth / 2;
    //     const y = - spaceSize.height / 2 + window.innerHeight / 2;

    //     if (!initialized) {
    //         dispatchSetAnimatedTransform(true);
    //         translateXWith(x);
    //         translateYWith(y);
    //         setTimeout(() => {
    //             dispatchSetAnimatedTransform(false);
    //         }, 450);
    //     }
    // }, 100);


    // const computedCulledFunction = () => {
    //     const culledView = space.computeCulledView(
    //         initialTree,
    //         view || [],
    //         stateSpaceLocation,
    //         1500,
    //     );

        // if (culledView && !arrays.equal(stateCulledView, culledView)) {
    //         dispatchSpaceSetCulledView(culledView);
    //     }
    // }

    // const computeCulled = useThrottledCallback(
    //     computedCulledFunction,
    //     500,
    // );


    // const computeTree = (
    //     tree: TreePlane[],
    // ) => {
    //     // const computedTree = computeSpaceTree(
    //     //     tree,
    //     //     stateConfiguration,
    //     //     view,
    //     // );
    //     // dispatchSetTree(computedTree);
    // }


    /** effects */
    /** Compute Application */
    useEffect(() => {
        computeApplication(
            configuration,
            planes,
            view,
            clusters,
            universes,
        );
    }, [
        configuration,
        planes,
        view,
        clusters,
        universes,
    ]);

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

    // /** Resize Listener */
    // useEffect(() => {
    //     const handleResize = meta.debounce(() => {
    //         if (viewElement && viewElement.current) {
    //             const width = viewElement.current.offsetWidth;
    //             const height = viewElement.current.offsetHeight;
    //             dispatchSetViewSize({
    //                 width,
    //                 height,
    //             });
    //         }
    //     }, 150);

    //     window.addEventListener('resize', handleResize);

    //     return () => {
    //         window.removeEventListener('resize', handleResize);
    //     }
    // }, []);

    // /** Set View Size */
    // useEffect(() => {
    //     if (viewElement && viewElement.current) {
    //         const width = viewElement.current.offsetWidth;
    //         const height = viewElement.current.offsetHeight;
    //         if (width && height) {
    //             dispatchSetViewSize({
    //                 height: viewElement.current.offsetHeight,
    //                 width: viewElement.current.offsetWidth,
    //             });
    //         }
    //     }
    // }, [
    //     viewElement.current,
    // ]);

    // /** View Size Listener */
    // useEffect(() => {
    //     computeTree(tree);
    // }, [
    //     viewSize,
    // ]);

    // /** Planes, Universes */
    // useEffect(() => {
    //     if (!universes && planes) {
    //         handlePlanes(planes);
    //     }

    //     if (universes) {
    //         handleUniverses(universes);
    //     }
    // }, [
    //     planes,
    //     universes,
    // ]);

    // /** State Configuration Layout */
    // useEffect(() => {
    //     computeTree(tree);
    // }, [
    //     stateConfiguration.space.layout,
    // ]);

    /** PubSub Subscribe */
    useEffect(() => {
        if (pubsub) {
            handlePubSubSubscribe(pubsub as any);
        }
    }, [
        pubsub,
    ]);

    /** PubSub Publish */
    useEffect(() => {
        if (pubsub) {
            handlePubSubPublish(pubsub as any);
        }
    }, [
        stateConfiguration,
        transform,
    ]);

    // /** Handle Tree */
    // useEffect(() => {
    //     const _view = stateCulledView.length > 0
    //         ? stateCulledView
    //         : view;

    //     const computedTree = space.computeViewTree(
    //         initialTree,
    //         _view,
    //     );

    //     dispatchSetTree(computedTree);
    // }, [
    //     initialTree,
    //     activeUniverseID,
    //     stateDataUniverses,
    //     contextUniversesRef.current,
    //     stateCulledView,
    // ]);

    // /** Handle Initial Tree */
    // useEffect(() => {
    //     if (initialTree.length === 0) {
    //         if (activeUniverseID && contextUniversesRef.current) {
    //             const activeUniverse = stateDataUniverses[activeUniverseID];
    //             const planes = activeUniverse.planes;

    //             const activeContextUniverse = contextUniversesRef.current[activeUniverseID];
    //             const contextPlanes = activeContextUniverse.planes;

    //             const treePlanes: TreePlane[] = [];
    //             for (const planeID in planes) {
    //                 const docPlane = planes[planeID]
    //                 const contextPlane = contextPlanes[planeID];
    //                 if (!contextPlane) {
    //                     continue;
    //                 }

    //                 const treePlane = createTreePlane(
    //                     contextPlane,
    //                     docPlane,
    //                 );
    //                 treePlanes.push(treePlane);
    //             }

    //             const computedTree = space.computeSpaceTree(
    //                 treePlanes,
    //                 stateConfiguration,
    //                 view,
    //             );
    //             dispatchSetInitialTree(computedTree);
    //         }
    //     }
    // }, [
    //     initialTree,
    //     activeUniverseID,
    //     stateDataUniverses,
    //     contextUniversesRef.current,
    // ]);

    /** Touch */
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        let touch: HammerManager;

        const handleTouch = async () => {
            const HammerImport = await loadHammer();
            const Hammer = HammerImport.default;

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

            if (!viewElement.current) {
                return;
            }

            touch = new Hammer(viewElement.current);
            touch.get('pan').set({ direction: Hammer.DIRECTION_ALL });
            touch.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

            if (transformTouch === TRANSFORM_TOUCHES.PAN) {
                touch.on('pan', handlePan);
            } else {
                touch.on('swipe', handleSwipe);
            }
        }

        handleTouch();

        return () => {
            const {
                transformTouch,
            } = stateConfiguration.space;

            if (transformTouch === TRANSFORM_TOUCHES.PAN) {
                if (touch) {
                    touch.off('pan', handlePan);
                }
            } else {
                if (touch) {
                    touch.off('swipe', handleSwipe);
                }
            }
        }
    }, [
        viewElement.current,
        stateConfiguration.space.transformTouch,
    ]);

    // /** Space Size */
    // useEffect(() => {
    //     const spaceSize = space.computeSpaceSize(tree);

    //     dispatchSetSpaceSize(spaceSize);
    //     // centerSpaceSize(spaceSize);
    // }, [
    //     tree,
    // ]);

    // /** Handle View */
    // useEffect(() => {
    //     if (view) {
    //         dispatchSpaceSetView(view);
    //     }
    // }, [
    //     view,
    // ]);

    // /** Handle Culled View */
    // useEffect(() => {
    //     computeCulled();
    // }, [
    //     tree,
    //     view,
    //     stateSpaceLocation,
    // ]);

    /** Index planesSources */
    useEffect(() => {
        if (indexedPlanes) {
            const planeSources: Record<string, string> = {};
            for (const [id, indexedPlane] of indexedPlanes) {
                planeSources[indexedPlane.route] = id;
            }

            dispatchDataSetPlaneSources(planeSources);
        }
    }, [
        indexedPlanes,
    ]);


    /** context */
    const pluridContext: PluridContext = {
        planeContext: appProperties.planeContext,
        planeContextValue: appProperties.planeContextValue,
        universes: contextUniversesRef.current,
        indexedPlanes: indexedPlanes || new Map(),
    };

    console.log('indexedPlanes', indexedPlanes);

    // console.log('Rendered');
    // console.log('configuration', configuration);
    // console.log('planes', planes);
    // console.log('view', view);
    // console.log('universes', universes);
    // console.log('---------------');


    /** render */
    const viewContainer = handleView(planes, universes);

    return (
        <StyledView
            ref={viewElement}
            tabIndex={0}
            transformMode={stateConfiguration.space.transformMode}
            data-plurid-entity={PLURID_ENTITY_VIEW}
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
    stateDataUniverses: selectors.data.getUniverses(state),
    viewSize: selectors.space.getViewSize(state),
    transform: selectors.space.getTransform(state),
    initialTree: selectors.space.getInitialTree(state),
    stateTree: selectors.space.getTree(state),
    activeUniverseID: selectors.space.getActiveUniverseID(state),
    spaceLoading: selectors.space.getLoading(state),
    stateSpaceLocation: selectors.space.getTransform(state),
    stateCulledView: selectors.space.getCulledView(state),
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

    dispatchSetUniverses: (universes: any) => dispatch(
        actions.data.setUniverses(universes)
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
    dispatchSetInitialTree: (
        tree: TreePlane[],
    ) => dispatch(
        actions.space.setInitialTree(tree),
    ),
    dispatchSetTree: (
        tree: TreePlane[],
    ) => dispatch(
        actions.space.setTree(tree),
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

    dispatchSetActiveUniverse: (activeUniverse: string) => dispatch(
        actions.space.setActiveUniverse(activeUniverse)
    ),

    dispatchSpaceSetView: (
        view,
    ) => dispatch(
        actions.space.spaceSetView(view),
    ),
    dispatchSpaceSetCulledView: (
        culledView,
    ) => dispatch(
        actions.space.spaceSetCulledView(culledView),
    ),

    dispatchDataSetPlaneSources: (
        planeSources,
    ) => dispatch(
        actions.data.setPlaneSources(planeSources),
    )
});


export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(View);
