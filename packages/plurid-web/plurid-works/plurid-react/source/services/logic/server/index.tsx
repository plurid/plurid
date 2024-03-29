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
    // #endregion external
// #endregion imports



// #region module
export const serverComputeMetastate = async (
    isoMatch: PluridRouteMatch,
    paths: PluridRoute<PluridReactComponent>[],
    globals: Record<string, string> | undefined,
    hostname = 'origin',
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

        const {
            computedTree,
            appConfiguration,
        } = computeApplication(
            planes,
            (isoMatch.data as any).defaultConfiguration,
            view,
            hostname,
        );
        // console.log({
        //     computedTree,
        // });

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
            },
            space: {
                loading: false,
                resolvedLayout: false,
                animatedTransform: false,
                transform: 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)',
                scale: 1,
                rotationX: 0,
                rotationY: 0,
                translationX: 0,
                translationY: 0,
                translationZ: 0,
                tree: computedTree,
                activeUniverseID: '',
                camera: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                viewSize: {
                    width: 1440,
                    height: 821,
                },
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
