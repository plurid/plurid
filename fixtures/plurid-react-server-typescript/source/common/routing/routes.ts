import {
    PluridServerRoute,
} from '@plurid/plurid-react-server';

import {
    Indexed,
} from '@plurid/plurid-data';

import paths from './paths';
import view from './view';



const createRoutes = <T>(
    paths: Indexed<string>,
    view: T,
) => {
    const routes: PluridServerRoute[] = [];

    for (const path of Object.values(paths)) {
        const pathView = view[path];

        if (pathView) {
            const route: PluridServerRoute = {
                path,
                view: pathView,
            };
            routes.push(route);
        }
    }

    return routes;
}


// const routes: PluridServerRoute[] = [
//     {
//         path: paths.index,
//         view: view.index,
//     },
//     {
//         path: paths.page,
//         view: view.page,
//     },
// ];

const routes: PluridServerRoute[] = createRoutes(
    paths,
    view,
);


export default routes;
