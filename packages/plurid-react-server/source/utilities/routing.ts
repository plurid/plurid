import {
    Indexed,
    PluridRouterRoute,
} from '@plurid/plurid-data';



export const mapPathsToRoutes = <T>(
    paths: Indexed<string>,
    view: T,
) => {
    const routes: PluridRouterRoute<T>[] = [];

    for (const path of Object.values(paths)) {
        const pathView = view[path];

        if (pathView) {
            const route: PluridRouterRoute<T> = {
                path,
                view: pathView,
            };
            routes.push(route);
        }
    }

    return routes;
}
