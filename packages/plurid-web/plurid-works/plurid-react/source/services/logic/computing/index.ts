// #region imports
    // #region libraries
    import {
        PluridPlane,
        PluridApplicationView,
        PluridPartialConfiguration,
        PluridConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';

    import {
        routing,
        space,
        generalEngine,

        PluridPlanesRegistrar,
    } from '~services/engine';
    // #endregion external
// #endregion imports



// #region module
export interface ComputeApplicationOptions {
    /** THE ADDRESS BAR IS THE PAGE on the server: the page path the request names, read against the merged configuration. */
    dockPath?: (configuration: PluridConfiguration) => string | null;
    /** The view the roots are laid out for when a deep link docks (the server's fixed guess). */
    viewSize?: { width: number; height: number };
}

export const computeApplication = (
    planes: PluridPlane<PluridReactComponent>[] | undefined,
    configuration: PluridPartialConfiguration | undefined,
    view: PluridApplicationView | undefined,
    origin = 'origin',
    options: ComputeApplicationOptions = {},
) => {
    const appConfiguration = generalEngine.configuration.merge(configuration);
    const dockPath = options.dockPath?.(appConfiguration) ?? null;

    const currentView = view || [];
    const absoluteView = [];

    for (const viewItem of currentView) {
        if (typeof viewItem === 'string') {
            const viewPath = routing.resolveRoute(viewItem);
            if (!viewPath) {
                continue;
            }
            absoluteView.push(viewPath.route);
        }
    }

    const registrar = new PluridPlanesRegistrar(
        planes,
        origin,
    );
    const registrarPlanes = registrar.getAll();

    // a deep link docks on a LAID-OUT tree (see the engine's `resolveSpace`): the layout-less tree
    // stacks every root at the origin
    const spaceTree = new space.tree.Tree(
        {
            planes: registrarPlanes,
            configuration: appConfiguration,
            view: absoluteView,
            ...(dockPath && options.viewSize ? { layout: true, viewSize: options.viewSize } : {}),
        },
        origin,
    );
    const computedTree = spaceTree.compute();


    const data = {
        computedTree,
        // planesPropertiesReference,
        appConfiguration,
        dockPath,
    };

    return data;
}


// #endregion module
