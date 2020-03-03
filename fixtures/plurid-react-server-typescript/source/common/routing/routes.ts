import {
    PluridServerRoute,
} from '@plurid/plurid-react-server';

import {
    view,
} from './view';



const routes: PluridServerRoute[] = [
    {
        path: '/',
        view: view.index,
    },
    {
        path: '/page',
        view: view.page,
    },
];


export default routes;
