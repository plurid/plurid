import {
    PluridRouterRoute,
} from '@plurid/plurid-data';

// import {
//     mapPathsToRoutes,
// } from '@plurid/plurid-engine';

import paths from './paths';
import view, {
    ViewType,
} from './view';



const routes: PluridRouterRoute<ViewType>[] = [
    {
        path: paths.index,
        view: view.index,
    },
    {
        path: paths.notFound,
        view: view.notFound,
    },
    {
        path: paths.page,
        view: view.page,
    },
];
// const routes: PluridRouterRoute<ViewType>[] = mapPathsToRoutes(
//     paths,
//     view,
// );


export default routes;
