import {
    PluridServerRoute,
} from '@plurid/plurid-react-server';

import view from './view';
import paths from './paths';



const routes: PluridServerRoute[] = [
    {
        path: paths.index,
        view: view.index,
    },
    {
        path: paths.page,
        view: view.page,
    },
];


export default routes;
