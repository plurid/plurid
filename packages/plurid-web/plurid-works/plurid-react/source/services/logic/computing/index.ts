// #region imports
    // #region libraries
    import {
        PluridPlane,
        PluridApplicationView,
        PluridPartialConfiguration,
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
export const computeApplication = (
    planes: PluridPlane<PluridReactComponent>[] | undefined,
    configuration: PluridPartialConfiguration | undefined,
    view: PluridApplicationView | undefined,
    origin = 'origin',
) => {
    const appConfiguration = generalEngine.configuration.merge(configuration);

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

    const spaceTree = new space.tree.Tree(
        {
            planes: registrarPlanes,
            configuration: appConfiguration,
            view: absoluteView,
        },
        origin,
    );
    const computedTree = spaceTree.compute();


    const data = {
        computedTree,
        // planesPropertiesReference,
        appConfiguration,
    };

    return data;
}


// #endregion module
