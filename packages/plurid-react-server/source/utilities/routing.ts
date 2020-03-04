import {
    Indexed,
    PluridRouterRoute,
} from '@plurid/plurid-data';



export const mapPathsToRoutes = <T>(
    paths: Indexed<string>,
    view: T,
) => {
    const routes: PluridRouterRoute<T>[] = [];

    for (const [key, path] of Object.entries(paths)) {
        const pathView = view[key];

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
