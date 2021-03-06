// // #region imports
//     // #region libraries
//     import React, {
//         useRef,
//         useCallback,
//         useState,
//         useEffect,
//     } from 'react';

//     import { AnyAction } from 'redux';
//     import { connect } from 'react-redux';
//     import { ThunkDispatch } from 'redux-thunk';

//     import {
//         /** constants */
//         PLURID_ENTITY_VIEW,
//         PLURID_PUBSUB_TOPIC,
//         defaultTreePlane,

//         /** enumerations */
//         TRANSFORM_MODES,
//         TRANSFORM_TOUCHES,

//         /** interfaces */
//         PluridApplication as PluridApplicationProperties,
//         PluridConfiguration as PluridAppConfiguration,
//         PluridPartialConfiguration,
//         PluridContext,
//         PluridPlane,
//         IndexedPluridPlane,
//         RegisteredPluridPlane,
//         PluridView,
//         TreePlane,
//         PluridPubSub as IPluridPubSub,
//     } from '@plurid/plurid-data';

//     import {
//         space,
//         router,
//         general as generalEngine,
//     } from '@plurid/plurid-engine';

//     import PluridPubSub from '@plurid/plurid-pubsub';

//     import {
//         meta,
//     } from '@plurid/plurid-functions';

//     import themes, {
//         Theme,
//         THEME_NAMES,
//     } from '@plurid/plurid-themes';
//     // #endregion libraries


//     // #region external
//     import Context from '~services/logic/context';

//     import {
//         handleGlobalShortcuts,
//         handleGlobalWheel,
//     } from '~services/logic/shortcuts';

//     import {
//         loadHammer,
//     } from '~services/utilities/imports';

//     import renderStatic from '~services/logic/static';

//     import { AppState } from '~services/state/store';
//     import selectors from '~services/state/selectors';
//     import actions from '~services/state/actions';
//     import StateContext from '~services/state/context';
//     import {
//         ViewSize,
//     } from '~services/state/types/space';
//     import {
//         SpaceSize,
//     } from '~services/state/modules/space/types';
//     // #endregion external


//     // #region internal
//     import './index.css';

//     import {
//         StyledEmpty,
//         GlobalStyle,
//         StyledView,
//     } from './styled';

//     import handleView from './logic';
//     // #endregion internal
// // #endregion imports



// // #region module
// export interface ViewOwnProperties {
//     application: PluridApplicationProperties;
// }

// export interface ViewStateProperties {
//     stateConfiguration: PluridAppConfiguration;
//     // stateDataUniverses: Indexed<PluridInternalStateUniverse>;
//     // viewSize: ViewSize;
//     stateSpaceLoading: boolean;
//     stateTransform: any;
//     // initialTree: TreePlane[];
//     // stateTree: TreePlane[];
//     // activeUniverseID: string;
//     // stateSpaceLocation: any;
//     // stateCulledView: any;
//     stateSpaceView: any[];
// }

// export interface ViewDispatchProperties {
//     dispatch: ThunkDispatch<{}, {}, AnyAction>;

//     dispatchSetConfiguration: typeof actions.configuration.setConfiguration;
//     dispatchSetConfigurationMicro: typeof actions.configuration.setConfigurationMicro;

//     // dispatchSetUniverses: typeof actions.data.setUniverses;

//     dispatchSetSpaceLoading: typeof actions.space.setSpaceLoading;
//     dispatchSetAnimatedTransform: typeof actions.space.setAnimatedTransform;
//     dispatchSetTransformTime: typeof actions.space.setTransformTime;
//     dispatchSetSpaceLocation: typeof actions.space.setSpaceLocation;
//     dispatchSetInitialTree: typeof actions.space.setInitialTree;
//     dispatchSetTree: typeof actions.space.setTree;
//     // dispatchSetSpaceSize: typeof actions.space.setSpaceSize;

//     dispatchSetGeneralTheme: typeof actions.themes.setGeneralTheme;
//     dispatchSetInteractionTheme: typeof actions.themes.setInteractionTheme;

//     dispatchRotateXWith: typeof actions.space.rotateXWith;
//     dispatchRotateX: typeof actions.space.rotateX;
//     dispatchRotateYWith: typeof actions.space.rotateYWith;
//     dispatchRotateY: typeof actions.space.rotateY;
//     // dispatchTranslateX: typeof actions.space.translateX;
//     dispatchTranslateXWith: typeof actions.space.translateXWith;
//     // dispatchTranslateY: typeof actions.space.translateY;
//     dispatchTranslateYWith: typeof actions.space.translateYWith;
//     // dispatchScaleUp: typeof actions.space.scaleUp;
//     dispatchScaleUpWith: typeof actions.space.scaleUpWith;
//     // dispatchScaleDown: typeof actions.space.scaleDown;
//     dispatchScaleDownWith: typeof actions.space.scaleDownWith;

//     // dispatchSetActiveUniverse: typeof actions.space.setActiveUniverse;

//     dispatchSpaceSetViewSize: typeof actions.space.setViewSize;
//     dispatchSpaceSetView: typeof actions.space.spaceSetView;
//     // dispatchSpaceSetCulledView: typeof actions.space.spaceSetCulledView;

//     // dispatchDataSetPlaneSources: typeof actions.data.setPlaneSources;
// }

// export type ViewProperties = ViewOwnProperties
//     & ViewStateProperties
//     & ViewDispatchProperties;

// const PluridView: React.FC<ViewProperties> = (
//     properties,
// ) => {
//     /** properties */
//     const {
//         /** own */
//         application,

//         /** state */
//         stateConfiguration,
//         stateSpaceLoading,
//         stateTransform,
//         stateSpaceView,

//         /** dispatch */
//         dispatch,
//         dispatchSetConfiguration,
//         dispatchSetConfigurationMicro,
//         dispatchSetGeneralTheme,
//         dispatchSetInteractionTheme,

//         dispatchSetSpaceLoading,
//         dispatchSetSpaceLocation,
//         dispatchSetAnimatedTransform,
//         dispatchSetTransformTime,
//         dispatchSetInitialTree,
//         dispatchSetTree,

//         dispatchRotateXWith,
//         dispatchRotateX,
//         dispatchRotateYWith,
//         dispatchRotateY,
//         dispatchTranslateXWith,
//         dispatchTranslateYWith,
//         dispatchScaleUpWith,
//         dispatchScaleDownWith,

//         dispatchSpaceSetViewSize,
//         dispatchSpaceSetView,
//     } = properties;

//     const {
//         configuration,
//         id: applicationID,
//         indexedPlanes,
//         pubsub,
//         static: staticProperty,
//         planes,
//         view,
//     } = application;

//     // console.log('APPLICATION view', view);



//     /** references */
//     // const pluridPubSub = useRef<(PluridPubSub | undefined)[]>(pubsub ? [pubsub] : []);
//     const planesRegistry = useRef<Map<string, RegisteredPluridPlane>>(
//         // indexedPlanes || new Map(),
//         new Map(),
//     );
//     const viewElement = useRef<HTMLDivElement>(null);


//     /** state */
//     const [pluridPubSub, setPluridPubSub] = useState<(IPluridPubSub | undefined)[]>(pubsub ? [pubsub] : []);


//     /** callbacks */
//     const shortcutsCallback = useCallback((event: KeyboardEvent) => {
//         const {
//             transformLocks,
//         } = stateConfiguration.space;

//         handleGlobalShortcuts(
//             dispatch,
//             event,
//             stateConfiguration.space.firstPerson,
//             transformLocks,
//         );
//     }, [
//         stateConfiguration.space.firstPerson,
//         stateConfiguration.space.transformLocks,
//         dispatch,
//     ]);

//     const wheelCallback = useCallback((event: WheelEvent) => {
//         const {
//             transformMode,
//             transformLocks,
//         } = stateConfiguration.space;

//         const transformModes = {
//             rotation: transformMode === TRANSFORM_MODES.ROTATION,
//             translation: transformMode === TRANSFORM_MODES.TRANSLATION,
//             scale: transformMode === TRANSFORM_MODES.SCALE,
//         };

//         handleGlobalWheel(
//             dispatch,
//             event,
//             transformModes,
//             transformLocks,
//         );
//     }, [
//         dispatch,
//         stateConfiguration.space.transformMode,
//         stateConfiguration.space.transformLocks,
//     ]);



//     /** handlers */
//     const handleConfiguration = (
//         configuration: PluridAppConfiguration,
//     ) => {
//         handleGlobalMicro(configuration);
//         handleGlobalTheme(configuration);

//         handleSpaceCenter(configuration);
//     }

//     const handleGlobalMicro = (
//         configuration: PluridAppConfiguration,
//     ) => {
//         if (configuration.global.micro) {
//             // dispatchSetConfigurationMicro();
//         }
//     }

//     const handleGlobalTheme = (
//         configuration: PluridAppConfiguration,
//     ) => {
//         if (typeof configuration.global.theme === 'object') {
//             const {
//                 general,
//                 interaction,
//             } = configuration.global.theme;

//             if (typeof general === 'string') {
//                 if (Object.keys(THEME_NAMES).includes(general)) {
//                     dispatchSetGeneralTheme((themes as any)[general]);
//                 }
//             }

//             if (typeof interaction === 'string') {
//                 if (Object.keys(THEME_NAMES).includes(interaction)) {
//                     dispatchSetInteractionTheme((themes as any)[interaction]);
//                 }
//             }
//         }
//     }

//     const handleSpaceCenter = (
//         configuration: PluridAppConfiguration,
//     ) => {
//         if (configuration.space.center && !configuration.space.camera) {
//             // center the camera within the space


//             // // const x = window.innerWidth / 2 - viewSize.width / 2 * configuration.elements.plane.width;
//             // const x = window.innerWidth / 2 - (window.innerWidth / 2 * configuration.elements.plane.width);
//             // dispatchTranslateXWith(x);

//             // // to get plane height;
//             // const planeHeight = 300;
//             // const y = window.innerHeight / 2 - planeHeight/2;
//             // dispatchTranslateYWith(y);
//         }
//     }

//     const computeTree = (
//         configuration: PluridAppConfiguration,
//         planes: Map<string, RegisteredPluridPlane>,
//         view: string[] | PluridView[],
//     ) => {
//         // console.log('computeTree view', view);
//         const spaceTree = new space.tree.Tree({
//             planes,
//             configuration,
//             view,
//         });

//         const computedTree = spaceTree.compute();

//         return computedTree;
//     }

//     const computeApplication = (
//         configuration: PluridPartialConfiguration | undefined,
//         planes: PluridPlane[] | undefined,
//         view: string[] | PluridView[] | undefined,
//         indexedPlanes: Map<string, IndexedPluridPlane> | undefined,
//     ) => {
//         const appConfiguration = generalEngine.configuration.merge(configuration);
//         handleConfiguration(appConfiguration);

//         // console.log('planes', planes);

//         if (planes) {
//             for (const plane of planes) {
//                 // loop over PluridPlanes and generate the Fully Qualified Route
//                 // given the FQR
//                 // store the component in an index by route

//                 const {
//                     component,
//                     route,
//                 } = plane;

//                 const {
//                     kind,
//                     element,
//                     properties,
//                 } = component;

//                 // obtain from path the absolute route
//                 // /plane -> Fully Qualified Route
//                 const resolvedRoute = router.resolveRoute(
//                     route,
//                     appConfiguration.network.protocol,
//                     appConfiguration.network.host,
//                 );
//                 // console.log('resolvedRoute', resolvedRoute);

//                 const {
//                     protocol,
//                     host,
//                     path: routePath,
//                     space,
//                     universe,
//                     cluster,
//                     plane: planePath,
//                     route: absoluteRoute,
//                 } = resolvedRoute;

//                 const registeredPluridPlane: RegisteredPluridPlane = {
//                     component,
//                     route: {
//                         protocol: {},
//                         host: {},
//                         path: {},
//                         space: {},
//                         universe: {},
//                         cluster: {},
//                         plane: {},
//                         absolute: absoluteRoute,
//                     },
//                 };

//                 planesRegistry.current.set(
//                     absoluteRoute,
//                     registeredPluridPlane,
//                 );
//             }

//             const spaceTree = computeTree(
//                 appConfiguration,
//                 planesRegistry.current,
//                 view || [],
//             );
//             // console.log('spaceTree', spaceTree);

//             // dispatchDataSetPlaneSources(planeSources);
//             // dispatchSetSpaceSize(spaceSize);
//             dispatchSetConfiguration(appConfiguration);
//             dispatchSetInitialTree(spaceTree);
//             dispatchSetTree(spaceTree);
//             // console.log('dispatchSpaceSetView view', view);
//             dispatchSpaceSetView(view || []);
//             dispatchSetSpaceLoading(false);
//         }
//     }


//     const handlePubSubSubscribe = (
//         pubsub: PluridPubSub,
//     ) => {
//         // pubsub.subscribe(PLURID_PUBSUB_TOPIC.SPACE_TRANSFORM, (data: any) => {
//         //     const {
//         //         value,
//         //         internal,
//         //     } = data;

//         //     if (internal) {
//         //         return;
//         //     }

//         //     dispatchSetSpaceLocation(value);
//         // });

//         // pubsub.subscribe(PLURID_PUBSUB_TOPIC.SPACE_ANIMATED_TRANSFORM, (data: any) => {
//         //     const {
//         //         value,
//         //     } = data;

//         //     dispatchSetAnimatedTransform(value.active);

//         //     if (value.time) {
//         //         dispatchSetTransformTime(value.time);
//         //     } else {
//         //         dispatchSetTransformTime(450);
//         //     }
//         // });

//         // pubsub.subscribe(PLURID_PUBSUB_TOPIC.SPACE_ROTATE_X_WITH, (data: any) => {
//         //     const {
//         //         value,
//         //     } = data;
//         //     dispatchRotateXWith(value);
//         // });

//         // pubsub.subscribe(PLURID_PUBSUB_TOPIC.SPACE_ROTATE_X_TO, (data: any) => {
//         //     const {
//         //         value,
//         //     } = data;
//         //     dispatchRotateX(value);
//         // });


//         // pubsub.subscribe(PLURID_PUBSUB_TOPIC.SPACE_ROTATE_Y_WITH, (data: any) => {
//         //     const {
//         //         value,
//         //     } = data;
//         //     dispatchRotateYWith(value);
//         // });

//         // pubsub.subscribe(PLURID_PUBSUB_TOPIC.SPACE_ROTATE_Y_TO, (data: any) => {
//         //     const {
//         //         value,
//         //     } = data;
//         //     dispatchRotateY(value);
//         // });


//         // pubsub.subscribe(PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_X_WITH, (data: any) => {
//         //     const {
//         //         value,
//         //     } = data;
//         //     dispatchTranslateXWith(value);
//         // });

//         // // pubsub.subscribe(PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_X_TO, (data: any) => {
//         // //     const {
//         // //         value,
//         // //     } = data;
//         // //     dispatchTranslateX(value);
//         // // });

//         // pubsub.subscribe(PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Y_WITH, (data: any) => {
//         //     const {
//         //         value,
//         //     } = data;
//         //     dispatchTranslateYWith(value);
//         // });

//         // // pubsub.subscribe(PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Y_TO, (data: any) => {
//         // //     const {
//         // //         value,
//         // //     } = data;
//         // //     dispatchTranslateY(value);
//         // // });


//         // pubsub.subscribe(PLURID_PUBSUB_TOPIC.VIEW_ADD_PLANE, (data: any) => {
//         //     const {
//         //         plane,
//         //     } = data;

//         //     const updatedView = [
//         //         ...stateSpaceView,
//         //         plane,
//         //     ];
//         //     dispatchSpaceSetView(updatedView);
//         // });

//         // pubsub.subscribe(PLURID_PUBSUB_TOPIC.VIEW_SET_PLANES, (data: any) => {
//         //     const {
//         //         view,
//         //     } = data;

//         //     dispatchSpaceSetView([
//         //         ...view,
//         //     ]);
//         // });

//         // pubsub.subscribe(PLURID_PUBSUB_TOPIC.VIEW_REMOVE_PLANE, (data: any) => {
//         //     const {
//         //         plane,
//         //     } = data;

//         //     /** TODO
//         //      * a less naive filtering
//         //      */
//         //     const updatedView = stateSpaceView.filter(view => {
//         //         if (typeof view === 'string') {
//         //             return view === plane;
//         //         }

//         //         return true;
//         //     });

//         //     dispatchSpaceSetView(updatedView);
//         // });
//     }

//     const handlePubSubPublish = (
//         pubsub: IPluridPubSub,
//     ) => {
//         const internalTransform = {
//             value: {
//                 ...stateTransform,
//             },
//             internal: true,
//         };
//         // pubsub.publish(PLURID_PUBSUB_TOPIC.SPACE_TRANSFORM, internalTransform);

//         // pubsub.publish(PLURID_PUBSUB_TOPIC.CONFIGURATION, stateConfiguration);
//     }

//     const registerPubSub = (
//         pubsub: PluridPubSub,
//     ) => {
//         const pluridPubSubs = [
//             ...pluridPubSub,
//             pubsub,
//         ];

//         // setPluridPubSub(pluridPubSubs);
//     }


//     const handleSwipe = (
//         event: HammerInput,
//     ) => {
//         const {
//             transformMode,
//         } = stateConfiguration.space;

//         const {
//             velocity,
//             distance,
//             direction,
//         } = event;

//         if (transformMode === TRANSFORM_MODES.ALL) {
//             return;
//         }

//         const rotationMode = transformMode === TRANSFORM_MODES.ROTATION;
//         const translationMode = transformMode === TRANSFORM_MODES.TRANSLATION;
//         const scalationMode = transformMode === TRANSFORM_MODES.SCALE;

//         dispatchSetAnimatedTransform(true);
//         switch (direction) {
//             case 2:
//                 /** right */
//                 if (rotationMode) {
//                     dispatchRotateYWith(velocity * 60);
//                 }

//                 if (translationMode) {
//                     dispatchTranslateXWith(-1 * distance);
//                 }
//                 break;
//             case 4:
//                 /** left */
//                 if (rotationMode) {
//                     dispatchRotateYWith(velocity * 60);
//                 }

//                 if (translationMode) {
//                     dispatchTranslateXWith(distance);
//                 }
//                 break;
//             case 8:
//                 /** top */
//                 if (rotationMode) {
//                     dispatchRotateXWith(velocity * 60);
//                 }

//                 if (translationMode) {
//                     dispatchTranslateYWith(-1 * distance);
//                 }

//                 if (scalationMode) {
//                     dispatchScaleUpWith(velocity);
//                 }
//                 break;
//             case 16:
//                 /** down */
//                 if (rotationMode) {
//                     dispatchRotateXWith(velocity * 60);
//                 }

//                 if (translationMode) {
//                     dispatchTranslateYWith(distance);
//                 }

//                 if (scalationMode) {
//                     dispatchScaleDownWith(velocity);
//                 }
//                 break;
//         }
//         setTimeout(() => {
//             dispatchSetAnimatedTransform(false);
//         }, 450);
//     }

//     const handlePan = (
//         event: HammerInput,
//     ) => {
//         const {
//             transformMode,
//         } = stateConfiguration.space;

//         const {
//             velocity,
//             distance,
//             direction,
//         } = event;

//         if (transformMode === TRANSFORM_MODES.ALL) {
//             return;
//         }

//         const rotationMode = transformMode === TRANSFORM_MODES.ROTATION;
//         const translationMode = transformMode === TRANSFORM_MODES.TRANSLATION;
//         const scalationMode = transformMode === TRANSFORM_MODES.SCALE;

//         const rotationVelocity = velocity * 20;
//         const translationVelocity = distance / 5;
//         const scaleVelocity = velocity / 4;

//         switch (direction) {
//             case 2:
//                 /** right */
//                 if (rotationMode) {
//                     dispatchRotateYWith(rotationVelocity);
//                 }

//                 if (translationMode) {
//                     dispatchTranslateXWith(-1 * translationVelocity);
//                 }
//                 break;
//             case 4:
//                 /** left */
//                 if (rotationMode) {
//                     dispatchRotateYWith(rotationVelocity);
//                 }

//                 if (translationMode) {
//                     dispatchTranslateXWith(translationVelocity);
//                 }
//                 break;
//             case 8:
//                 /** top */
//                 if (rotationMode) {
//                     dispatchRotateXWith(rotationVelocity);
//                 }

//                 if (translationMode) {
//                     dispatchTranslateYWith(-1 * translationVelocity);
//                 }

//                 if (scalationMode) {
//                     dispatchScaleUpWith(scaleVelocity);
//                 }
//                 break;
//             case 16:
//                 /** down */
//                 if (rotationMode) {
//                     dispatchRotateXWith(rotationVelocity);
//                 }

//                 if (translationMode) {
//                     dispatchTranslateYWith(translationVelocity);
//                 }

//                 if (scalationMode) {
//                     dispatchScaleDownWith(scaleVelocity);
//                 }
//                 break;
//         }
//     }



//     /** effects */
//     /** Compute Application */
//     useEffect(() => {
//         // console.log('USE EFFECT view', view);
//         // console.log('USE EFFECT stateSpaceView', stateSpaceView);

//         if (stateSpaceView.length === 0) {
//             computeApplication(
//                 configuration,
//                 planes,
//                 view,
//                 indexedPlanes,
//             );
//         } else {
//             computeApplication(
//                 configuration,
//                 planes,
//                 stateSpaceView,
//                 indexedPlanes,
//             );
//         }
//     }, [
//         configuration,
//         planes,
//         view,
//         stateSpaceView,
//         indexedPlanes,
//     ]);


//     /** Keydown, Wheel Listeners */
//     useEffect(() => {
//         if (viewElement.current) {
//             viewElement.current.addEventListener(
//                 'keydown',
//                 shortcutsCallback,
//                 {
//                     passive: false,
//                 },
//             );
//             viewElement.current.addEventListener(
//                 'wheel',
//                 wheelCallback,
//                 {
//                     passive: false,
//                 },
//             );
//         }

//         return () => {
//             if (viewElement.current) {
//                 viewElement.current.removeEventListener(
//                     'keydown',
//                     shortcutsCallback,
//                 );
//                 viewElement.current.removeEventListener(
//                     'wheel',
//                     wheelCallback,
//                 );
//             }
//         }
//     }, [
//         viewElement.current,
//         stateConfiguration.space.transformMode,
//         stateConfiguration.space.firstPerson,
//     ]);

//     /** Resize Listener */
//     useEffect(() => {
//         const handleResize = meta.debounce(() => {
//             if (viewElement && viewElement.current) {
//                 const width = viewElement.current.offsetWidth;
//                 const height = viewElement.current.offsetHeight;
//                 dispatchSpaceSetViewSize({
//                     width,
//                     height,
//                 });
//             }
//         }, 150);

//         window.addEventListener('resize', handleResize);

//         return () => {
//             window.removeEventListener('resize', handleResize);
//         }
//     }, []);

//     /** Touch */
//     useEffect(() => {
//         if (typeof window === 'undefined') {
//             return;
//         }

//         let touch: HammerManager;

//         const handleTouch = async () => {
//             const HammerImport = await loadHammer();
//             const Hammer = HammerImport.default;

//             const {
//                 transformTouch,
//             } = stateConfiguration.space;

//             /**
//              * Remove Hammerjs default css properties to add them only when in Lock Mode.
//              * https://stackoverflow.com/a/37896547
//              */
//             delete (Hammer as any).defaults.cssProps.userSelect;
//             delete (Hammer as any).defaults.cssProps.userDrag;
//             delete (Hammer as any).defaults.cssProps.tapHighlightColor;
//             delete (Hammer as any).defaults.cssProps.touchSelect;

//             if (!viewElement.current) {
//                 return;
//             }

//             touch = new Hammer(viewElement.current);
//             touch.get('pan').set({ direction: Hammer.DIRECTION_ALL });
//             touch.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

//             if (transformTouch === TRANSFORM_TOUCHES.PAN) {
//                 touch.on('pan', handlePan);
//             } else {
//                 touch.on('swipe', handleSwipe);
//             }
//         }

//         handleTouch();

//         return () => {
//             const {
//                 transformTouch,
//             } = stateConfiguration.space;

//             if (transformTouch === TRANSFORM_TOUCHES.PAN) {
//                 if (touch) {
//                     touch.off('pan', handlePan);
//                 }
//             } else {
//                 if (touch) {
//                     touch.off('swipe', handleSwipe);
//                 }
//             }
//         }
//     }, [
//         viewElement.current,
//         stateConfiguration.space.transformTouch,
//     ]);

//     /** PubSub Subscribe */
//     useEffect(() => {
//         for (const pubsub of pluridPubSub) {
//             if (pubsub) {
//                 handlePubSubSubscribe(pubsub as any);
//             }
//         }
//     }, [
//         pluridPubSub.length,
//     ]);

//     /** PubSub Publish */
//     useEffect(() => {
//         for (const pubsub of pluridPubSub) {
//             if (pubsub) {
//                 handlePubSubPublish(pubsub);
//             }
//         }
//     }, [
//         pluridPubSub.length,
//         stateConfiguration,
//         stateTransform,
//     ]);

//     /** Handle configuration. */
//     useEffect(() => {
//         handleSpaceCenter(stateConfiguration);
//     }, [
//         stateConfiguration.space.center,
//     ]);


//     /** context */
//     const pluridContext: PluridContext = {
//         // planesRegistry: planesRegistry.current,
//         registerPubSub,
//         // planesMap: indexedPlanesReference.current,
//         // planesProperties: planesPropertiesReference.current,
//         // planeContext: pluridApplication.planeContext,
//         // planeContextValue: pluridApplication.planeContextValue,
//     };

//     // console.log('planesRegistry', planesRegistry)



//     /** render */
//     const viewContainer = handleView(planes as any);

//     return (
//         <StyledView
//             ref={viewElement}
//             tabIndex={0}
//             transformMode={stateConfiguration.space.transformMode}
//             data-plurid-entity={PLURID_ENTITY_VIEW}
//         >
//             {!stateSpaceLoading && (
//                 <>
//                     <GlobalStyle />

//                     <Context.Provider
//                         value={pluridContext}
//                     >
//                         {viewContainer}
//                     </Context.Provider>
//                 </>
//             )}
//         </StyledView>
//     );



//     // /** properties */
//     // const {
//     //     /** own */
//     //     pluridApplication,

//     //     /** state */
//     //     stateConfiguration,
//     //     spaceLoading,
//     //     // initialTree,
//     //     // stateTree,
//     //     // viewSize,
//     //     transform,
//     //     // stateDataUniverses,
//     //     // activeUniverseID,
//     //     // stateSpaceLocation,
//     //     // stateCulledView,

//     //     /** dispatch */
//     //     dispatch,

//     //     dispatchSetConfiguration,
//     //     dispatchSetConfigurationMicro,

//     //     // dispatchSetUniverses,
//     //     // dispatchSetViewSize,

//     //     dispatchSetSpaceLoading,
//     //     dispatchSetAnimatedTransform,
//     //     // dispatchSetSpaceLocation,
//     //     dispatchSetInitialTree,
//     //     dispatchSetTree,
//     //     dispatchSetSpaceSize,

//     //     dispatchSetGeneralTheme,
//     //     dispatchSetInteractionTheme,

//     //     rotateXWith,
//     //     rotateYWith,
//     //     translateXWith,
//     //     translateYWith,
//     //     scaleUpWith,
//     //     scaleDownWith,

//     //     // dispatchSetActiveUniverse,

//     //     // dispatchSpaceSetView,
//     //     // dispatchSpaceSetCulledView,

//     //     dispatchDataSetPlaneSources,
//     // } = properties;

//     // const {
//     //     configuration,
//     //     planes,
//     //     indexedPlanes,
//     //     view,
//     //     pubsub,
//     // } = pluridApplication;

//     // // console.log('View stateTree', stateTree);


//     // /** references */
//     // const indexedPlanesReference = useRef<Map<string, IndexedPluridPlane>>(indexedPlanes || new Map());
//     // const planesPropertiesReference = useRef<Map<string, any>>(new Map());
//     // const viewElement = useRef<HTMLDivElement>(null);


//     // /** handlers */
//     // const computeTree = (
//     //     configuration: PluridAppConfiguration,
//     //     treePlanes: TreePlane[],
//     //     view: string[] | PluridView[] | undefined,
//     // ) => {
//     //     const spaceTree = new space.tree.Tree({
//     //         planes: treePlanes,
//     //         configuration,
//     //         view,
//     //     });

//     //     const computedTree = spaceTree.compute();

//     //     return computedTree;
//     // }


//     // const computeApplication = (
//     //     configuration: PluridPartialConfiguration | undefined,
//     //     planes: PluridPlane[] | undefined,
//     //     view: string[] | PluridView[] | undefined,
//     //     indexedPlanes: Map<string, IndexedPluridPlane> | undefined,
//     // ) => {
//     //     /** computing */
//     //     // merge user and default configuration
//     //     const appConfiguration = generalEngine.configuration.default(configuration);

//     //     handleConfiguration(appConfiguration);

//     //     // console.log('PLANES', planes);
//     //     // console.log('--- indexedPlanes', indexedPlanes);

//     //     // merge computedIndexedPlanes
//     //     const computedIndexedPlanes = new Map<string, IndexedPluridPlane>(
//     //         indexedPlanes || new Map()
//     //     );

//     //     if (planes) {
//     //         for (const plane of planes) {
//     //             const linkPath = router.resolveAbsolutePluridLinkPath(plane.path);
//     //             console.log('linkPath', linkPath);
//     //             if (!linkPath) {
//     //                 continue;
//     //             }

//     //             const {
//     //                 protocol,
//     //                 host,
//     //                 path,
//     //                 space,
//     //                 universe,
//     //                 cluster,
//     //                 plane: planePath,
//     //                 resolvedPath,
//     //             } = linkPath;

//     //             const computedIndexedPlane: IndexedPluridPlane = {
//     //                 protocol,
//     //                 host: host.value,
//     //                 path: path.value,
//     //                 space: space.value,
//     //                 universe: universe.value,
//     //                 cluster: cluster.value,
//     //                 plane: planePath.value,
//     //                 route: resolvedPath,
//     //                 component: plane.component,
//     //             };
//     //             const id = resolvedPath;

//     //             const planeProperties = {
//     //                 ...plane.component.properties,
//     //             };
//     //             planesPropertiesReference.current.set(id, planeProperties);

//     //             computedIndexedPlanes.set(id, computedIndexedPlane);
//     //         }
//     //     }

//     //     indexedPlanesReference.current = new Map(computedIndexedPlanes);
//     //     console.log('indexedPlanesReference', indexedPlanesReference);

//     //     const planeSources: Record<string, string> = {};
//     //     for (const [id, indexedPlane] of computedIndexedPlanes) {
//     //         planeSources[indexedPlane.route] = id;
//     //     }
//     //     console.log('planeSources', planeSources);

//     //     // create tree planes

//     //     for (const [id, computedIndexedPlane] of computedIndexedPlanes) {
//     //         const pathProperties = computedIndexedPlane.component.properties?.plurid?.path;

//     //         let planeRouteSource = computedIndexedPlane.route;

//     //         if (pathProperties) {
//     //             for (const [key, value] of Object.entries(pathProperties.parameters)) {
//     //                 planeRouteSource = planeRouteSource.replace(`:${key}`, value as string);
//     //             }
//     //         }

//     //         const planeRoute = router.resolveAbsolutePluridLinkPath(planeRouteSource);
//     //         if (!planeRoute) {
//     //             continue;
//     //         }

//     //         const {
//     //             protocol,
//     //             host,
//     //             path,
//     //             space,
//     //             universe,
//     //             cluster,
//     //             plane,
//     //         } = planeRoute;

//     //         const treePlane: TreePlane = {
//     //             ...defaultTreePlane,
//     //             routeDivisions: {
//     //                 protocol,
//     //                 host,
//     //                 path,
//     //                 space,
//     //                 universe,
//     //                 cluster,
//     //                 plane,
//     //                 valid: true,
//     //             },
//     //             sourceID: id,
//     //             route: planeRouteSource,
//     //             planeID: uuid.generate(),
//     //             show: true,
//     //         };
//     //         treePlanes.push(treePlane);
//     //     }


//     //     // create absolute view
//     //     const currentView = view || [];
//     //     const absoluteView = [];

//     //     for (const viewItem of currentView) {
//     //         if (typeof viewItem === 'string') {
//     //             console.log('viewItem', viewItem);
//     //             console.log('treePlanes', treePlanes);

//     //             const viewPath = router.resolveAbsolutePluridLinkPath(viewItem);
//     //             if (!viewPath) {
//     //                 continue;
//     //             }

//     //             // check if parametric

//     //             console.log('viewPath', viewPath);

//     //             absoluteView.push(viewPath.resolvedPath);
//     //         }
//     //     }


//     //     // create tree
//     //     const newTree = computeTree(
//     //         appConfiguration,
//     //         treePlanes,
//     //         absoluteView,
//     //     );
//     //     console.log('newTree', newTree);


//     //     const spaceSize = space.utilities.computeSpaceSize(newTree);


//     //     /** assignments */
//     //     dispatchSetSpaceSize(spaceSize);
//     //     dispatchSetConfiguration(appConfiguration);
//     //     dispatchSetInitialTree(newTree);
//     //     dispatchSetTree(newTree);
//     //     dispatchSetSpaceLoading(false);
//     //     dispatchDataSetPlaneSources(planeSources);
//     // }




//     // // const centerSpaceSize = useDebouncedCallback((
//     // //     spaceSize: any,
//     // // ) => {
//     // //     const x = - spaceSize.width / 2 + window.innerWidth / 2;
//     // //     const y = - spaceSize.height / 2 + window.innerHeight / 2;

//     // //     if (!initialized) {
//     // //         dispatchSetAnimatedTransform(true);
//     // //         translateXWith(x);
//     // //         translateYWith(y);
//     // //         setTimeout(() => {
//     // //             dispatchSetAnimatedTransform(false);
//     // //         }, 450);
//     // //     }
//     // // }, 100);

//     // // const computedCulledFunction = () => {
//     // //     const culledView = space.computeCulledView(
//     // //         initialTree,
//     // //         view || [],
//     // //         stateSpaceLocation,
//     // //         1500,
//     // //     );

//     //     // if (culledView && !arrays.equal(stateCulledView, culledView)) {
//     // //         dispatchSpaceSetCulledView(culledView);
//     // //     }
//     // // }

//     // // const computeCulled = useThrottledCallback(
//     // //     computedCulledFunction,
//     // //     500,
//     // // );


//     // /** effects */
//     // /** Compute Application */
//     // useEffect(() => {
//     //     // console.log('COMPUTE APPLICATION EFFECT');
//     //     computeApplication(
//     //         configuration,
//     //         planes,
//     //         view,
//     //         indexedPlanes,
//     //         // clusters,
//     //         // universes,
//     //     );
//     // }, [
//     //     configuration,
//     //     planes,
//     //     view,
//     //     indexedPlanes,
//     //     // clusters,
//     //     // universes,
//     // ]);


//     // // /** Set View Size */
//     // // useEffect(() => {
//     // //     if (viewElement && viewElement.current) {
//     // //         const width = viewElement.current.offsetWidth;
//     // //         const height = viewElement.current.offsetHeight;
//     // //         if (width && height) {
//     // //             dispatchSetViewSize({
//     // //                 height: viewElement.current.offsetHeight,
//     // //                 width: viewElement.current.offsetWidth,
//     // //             });
//     // //         }
//     // //     }
//     // // }, [
//     // //     viewElement.current,
//     // // ]);

//     // // /** View Size Listener */
//     // // useEffect(() => {
//     // //     computeTree(tree);
//     // // }, [
//     // //     viewSize,
//     // // ]);

//     // // /** State Configuration Layout */
//     // // useEffect(() => {
//     // //     computeTree(tree);
//     // // }, [
//     // //     stateConfiguration.space.layout,
//     // // ]);


//     // // /** Handle Tree */
//     // // useEffect(() => {
//     // //     const _view = stateCulledView.length > 0
//     // //         ? stateCulledView
//     // //         : view;

//     // //     const computedTree = space.computeViewTree(
//     // //         initialTree,
//     // //         _view,
//     // //     );

//     // //     dispatchSetTree(computedTree);
//     // // }, [
//     // //     initialTree,
//     // //     activeUniverseID,
//     // //     stateDataUniverses,
//     // //     contextUniversesRef.current,
//     // //     stateCulledView,
//     // // ]);

//     // // /** Handle Initial Tree */
//     // // useEffect(() => {
//     // //     if (initialTree.length === 0) {
//     // //         if (activeUniverseID && contextUniversesRef.current) {
//     // //             const activeUniverse = stateDataUniverses[activeUniverseID];
//     // //             const planes = activeUniverse.planes;

//     // //             const activeContextUniverse = contextUniversesRef.current[activeUniverseID];
//     // //             const contextPlanes = activeContextUniverse.planes;

//     // //             const treePlanes: TreePlane[] = [];
//     // //             for (const planeID in planes) {
//     // //                 const docPlane = planes[planeID]
//     // //                 const contextPlane = contextPlanes[planeID];
//     // //                 if (!contextPlane) {
//     // //                     continue;
//     // //                 }

//     // //                 const treePlane = createTreePlane(
//     // //                     contextPlane,
//     // //                     docPlane,
//     // //                 );
//     // //                 treePlanes.push(treePlane);
//     // //             }

//     // //             const computedTree = space.computeSpaceTree(
//     // //                 treePlanes,
//     // //                 stateConfiguration,
//     // //                 view,
//     // //             );
//     // //             dispatchSetInitialTree(computedTree);
//     // //         }
//     // //     }
//     // // }, [
//     // //     initialTree,
//     // //     activeUniverseID,
//     // //     stateDataUniverses,
//     // //     contextUniversesRef.current,
//     // // ]);


//     // // /** Space Size */
//     // // useEffect(() => {
//     // //     const spaceSize = space.computeSpaceSize(tree);

//     // //     dispatchSetSpaceSize(spaceSize);
//     // //     // centerSpaceSize(spaceSize);
//     // // }, [
//     // //     tree,
//     // // ]);

//     // // /** Handle View */
//     // // useEffect(() => {
//     // //     if (view) {
//     // //         dispatchSpaceSetView(view);
//     // //     }
//     // // }, [
//     // //     view,
//     // // ]);

//     // // /** Handle Culled View */
//     // // useEffect(() => {
//     // //     computeCulled();
//     // // }, [
//     // //     tree,
//     // //     view,
//     // //     stateSpaceLocation,
//     // // ]);


//     // // const [hasMounted, setHasMounted] = React.useState(false);

//     // // React.useEffect(() => {
//     // //     setHasMounted(true);
//     // // }, []);

//     // // if (!hasMounted) {
//     // //     return null;
//     // //     // return (
//     // //     //     <StyledEmpty
//     // //     //         style={{
//     // //     //             height: typeof window === 'object' ? window.innerHeight : '800px',
//     // //     //             width: typeof window === 'object' ? window.innerWidth : '100%',
//     // //     //         }}
//     // //     //     >
//     // //     //         <GlobalStyle />
//     // //     //     </StyledEmpty>
//     // //     // );
//     // // }


//     // /** context */
//     // const pluridContext: PluridContext = {
//     //     planesMap: indexedPlanesReference.current,
//     //     planesProperties: planesPropertiesReference.current,
//     //     planeContext: pluridApplication.planeContext,
//     //     planeContextValue: pluridApplication.planeContextValue,
//     // };


//     // /** render */
//     // const viewContainer = handleView(planes);

//     // // const [hasMounted, setHasMounted] = React.useState(false);
//     // // useEffect(() => {
//     // //     setHasMounted(true);
//     // // }, []);

//     // // if (!hasMounted) {
//     // //     return renderStatic(
//     // //         pluridApplication,
//     // //     );
//     // // }

//     // return (
//     //     <StyledView
//     //         ref={viewElement}
//     //         tabIndex={0}
//     //         transformMode={stateConfiguration.space.transformMode}
//     //         data-plurid-entity={PLURID_ENTITY_VIEW}
//     //     >
//     //         {!spaceLoading && (
//     //             <>
//     //                 <GlobalStyle />

//     //                 <Context.Provider
//     //                     value={pluridContext}
//     //                 >
//     //                     {viewContainer}
//     //                 </Context.Provider>
//     //             </>
//     //         )}
//     //     </StyledView>
//     // );
// }


// const mapStateToProperties = (
//     state: AppState,
// ): ViewStateProperties => ({
//     stateConfiguration: selectors.configuration.getConfiguration(state),
//     // stateDataUniverses: selectors.data.getUniverses(state),
//     // viewSize: selectors.space.getViewSize(state),
//     stateTransform: selectors.space.getTransform(state),
//     // initialTree: selectors.space.getInitialTree(state),
//     // stateTree: selectors.space.getTree(state),
//     // activeUniverseID: selectors.space.getActiveUniverseID(state),
//     stateSpaceLoading: selectors.space.getLoading(state),
//     // stateSpaceLocation: selectors.space.getTransform(state),
//     // stateCulledView: selectors.space.getCulledView(state),
//     stateSpaceView: selectors.space.getView(state),
// });


// const mapDispatchToProperties = (
//     dispatch: ThunkDispatch<{}, {}, AnyAction>,
// ): ViewDispatchProperties => ({
//     dispatch,

//     dispatchSetConfiguration: (configuration: PluridAppConfiguration) => dispatch(
//         actions.configuration.setConfiguration(configuration)
//     ),
//     dispatchSetConfigurationMicro: () => dispatch(
//         actions.configuration.setConfigurationMicro()
//     ),

//     // dispatchSetUniverses: (universes: any) => dispatch(
//     //     actions.data.setUniverses(universes)
//     // ),
//     dispatchSpaceSetViewSize: (viewSize: ViewSize) => dispatch(
//         actions.space.setViewSize(viewSize)
//     ),

//     dispatchSetSpaceLoading: (loading: boolean) => dispatch(
//         actions.space.setSpaceLoading(loading)
//     ),
//     dispatchSetAnimatedTransform: (animated: boolean) => dispatch(
//         actions.space.setAnimatedTransform(animated)
//     ),
//     dispatchSetTransformTime: (
//         value,
//     ) => dispatch(
//         actions.space.setTransformTime(value)
//     ),
//     dispatchSetSpaceLocation: (spaceLocation: any) => dispatch(
//         actions.space.setSpaceLocation(spaceLocation)
//     ),
//     dispatchSetInitialTree: (
//         tree: TreePlane[],
//     ) => dispatch(
//         actions.space.setInitialTree(tree),
//     ),
//     dispatchSetTree: (
//         tree: TreePlane[],
//     ) => dispatch(
//         actions.space.setTree(tree),
//     ),
//     // dispatchSetSpaceSize: (payload: SpaceSize) => dispatch(
//     //     actions.space.setSpaceSize(payload)
//     // ),

//     dispatchSetGeneralTheme: (theme: Theme) => dispatch(
//         actions.themes.setGeneralTheme(theme)
//     ),
//     dispatchSetInteractionTheme: (theme: Theme) => dispatch(
//         actions.themes.setInteractionTheme(theme)
//     ),

//     dispatchRotateX: (value) => dispatch(
//         actions.space.rotateX(value)
//     ),
//     dispatchRotateXWith: (value) => dispatch(
//         actions.space.rotateXWith(value)
//     ),
//     dispatchRotateY: (value) => dispatch(
//         actions.space.rotateY(value)
//     ),
//     dispatchRotateYWith: (value) => dispatch(
//         actions.space.rotateYWith(value)
//     ),
//     // dispatchTranslateX: (value) => dispatch(
//     //     actions.space.translateX(value)
//     // ),
//     dispatchTranslateXWith: (value) => dispatch(
//         actions.space.translateXWith(value)
//     ),
//     // dispatchTranslateY: (value) => dispatch(
//     //     actions.space.translateY(value)
//     // ),
//     dispatchTranslateYWith: (value) => dispatch(
//         actions.space.translateYWith(value)
//     ),
//     // dispatchScaleUp: (value) => dispatch(
//     //     actions.space.scaleUp(value)
//     // ),
//     dispatchScaleUpWith: (value) => dispatch(
//         actions.space.scaleUpWith(value)
//     ),
//     // dispatchScaleDown: (value) => dispatch(
//     //     actions.space.scaleDown(value)
//     // ),
//     dispatchScaleDownWith: (value) => dispatch(
//         actions.space.scaleDownWith(value)
//     ),

//     // dispatchSetActiveUniverse: (activeUniverse: string) => dispatch(
//     //     actions.space.setActiveUniverse(activeUniverse)
//     // ),

//     dispatchSpaceSetView: (
//         view,
//     ) => dispatch(
//         actions.space.spaceSetView(view),
//     ),
//     // dispatchSpaceSetCulledView: (
//     //     culledView,
//     // ) => dispatch(
//     //     actions.space.spaceSetCulledView(culledView),
//     // ),

//     // dispatchDataSetPlaneSources: (
//     //     planeSources,
//     // ) => dispatch(
//     //     actions.data.setPlaneSources(planeSources),
//     // ),
// });


// const ConnectedView = connect(
//     mapStateToProperties,
//     mapDispatchToProperties,
//     null,
//     {
//         context: StateContext,
//     },
// )(PluridView);
// // #endregion module



// // #region exports
// export default ConnectedView;
// // #endregion exports


export {};
