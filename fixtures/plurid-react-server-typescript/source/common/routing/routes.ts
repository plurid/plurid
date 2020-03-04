import {
    PluridRouterRoute,
} from '@plurid/plurid-data';

import {
    mapPathsToRoutes,
} from '@plurid/plurid-react-server';

import paths from './paths';
import view, {
    // ViewType,
} from './view';



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
