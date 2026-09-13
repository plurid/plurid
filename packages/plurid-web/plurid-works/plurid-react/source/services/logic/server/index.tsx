// #region imports
    // #region libraries
    import themes from '@plurid/plurid-themes';

    import {
        PluridMetastate,
        PluridRoute,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
        PluridRouteMatch,
    } from '~data/interfaces';

    import {
        collectApplicationsFromPath,
    } from '../router';

    import {
        computeApplication,
    } from '../computing';

    import {
        interaction,
        generalEngine,
        routing,
        state as stateEngine,
    } from '~services/engine';
    // #endregion external
// #endregion imports



// #region module
export const serverComputeMetastate = async (
    isoMatch: PluridRouteMatch,
    paths: PluridRoute<PluridReactComponent>[],
    globals: Record<string, string> | undefined,
    hostname = 'origin',
    /** The request's location, for THE ADDRESS BAR IS THE PAGE: a root deep link renders docked. */
    location?: { pathname: string; search: string },
): Promise<PluridMetastate> => {
    const protocol = 'http';

    const pluridApplications = await collectApplicationsFromPath(
        isoMatch,
        protocol,
        hostname,
        globals,
    );

    const states: any = {};

    for (const application of pluridApplications) {
        const {
            planes,
            view,
            configuration,
        } = application;
        // console.log('serverComputeMetastate view', view);

        // if (view.length === 0) {
        //     continue;
        // }

        // the server's view is a fixed guess; the client re-measures and follows the docked page
        const viewSize = { width: 1440, height: 821 };
        const {
            computedTree,
            appConfiguration,
            dockPath,
        } = computeApplication(
            planes,
            (isoMatch.data as any).defaultConfiguration,
            view,
            hostname,
            {
                viewSize,
                // the application always sits inside the static router here: the binding's query mode
                dockPath: (merged) => {
                    const binding = generalEngine.configuration.resolveDockingURL(merged.space.docking?.url, { router: true });
                    return binding?.restore && location ? routing.dockingURLTarget(binding, location) : null;
                },
            },
        );
        // console.log({
        //     computedTree,
        // });

        const cameraLimits = interaction.camera.resolveCameraLimits(appConfiguration.space.navigation);
        const identity = interaction.camera.identityCamera(viewSize, appConfiguration.space.perspective);
        const camera = stateEngine.dockedBootCamera(identity, computedTree, appConfiguration, viewSize, cameraLimits, dockPath) ?? identity;
        const legacy = interaction.camera.toLegacy(camera, viewSize);

        const state = {
            configuration: {
                ...appConfiguration,
            },
            shortcuts: {
                global: true,
            },
            themes: {
                general: themes.plurid,
                interaction: themes.plurid,
            },
            ui: {
                toolbarScrollPosition: 50,
                grabMode: false,
                grabHold: false,
                shortcutsOverlayVisible: false,
            },
            space: {
                loading: false,
                resolvedLayout: false,
                transform: interaction.camera.cameraMatrix3d(camera, viewSize),
                scale: legacy.scale,
                rotationX: legacy.rotationX,
                rotationY: legacy.rotationY,
                translationX: legacy.translationX,
                translationY: legacy.translationY,
                translationZ: legacy.translationZ,
                tree: computedTree,
                activeUniverseID: '',
                camera,
                cameraLimits,
                motion: 'idle',
                dockingPlaneID: '',
                viewSize,
                spaceSize: {
                    width: 1440,
                    height: 821,
                    depth: 0,
                    topCorner: {
                        x: 0,
                        y: 0,
                        z: 0,
                    },
                },
                view,
                culledView: [],
                culled: {
                    hidden: [],
                    frozen: [],
                    detached: [],
                },
                selectedPlaneIDs: [],
                draggingSelection: false,
                history: {
                    canUndo: false,
                    canRedo: false,
                    undoDepth: 0,
                    redoDepth: 0,
                    past: [],
                    future: [],
                },
            },
        };

        // const id = matchedRoute.path.value;
        const id = (isoMatch.data as any).value;
        // console.log('matchedRoute id', id);

        states[id] = state;
    }

    // console.log(states);

    return {
        states,
    };
}
// #endregion module
