import {
    PluridRouterRoute,
} from '@plurid/plurid-data';

// import {
//     router,
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
        path: paths.static,
        view: view.static,
    },
    {
        path: paths.page,
        view: view.page,
    },
];
// const routes: PluridRouterRoute<ViewType>[] = router.mapPathsToRoutes(
//     paths,
//     view,
// );


export default routes;
