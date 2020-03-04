import {
    Indexed,
    PluridRouterRoute,
} from '@plurid/plurid-data';

import paths from './paths';
import view from './view';



const mapPathsToRoutes = <T>(
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


// const routes: PluridRouterRoute<any>[] = [
//     {
//         path: paths.index,
//         view: view.index,
//     },
//     {
//         path: paths.page,
//         view: view.page,
//     },
// ];

const routes: PluridRouterRoute<any>[] = mapPathsToRoutes(
    paths,
    view,
);


export default routes;
