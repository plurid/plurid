import type {
    PluridRoute,
} from '@plurid/plurid-react';

import {
    Home,
    About,
} from '../planes';



/**
 * One route: the site. Its planes are pages (`presentation: 'page'`): the camera is docked on
 * the first one, a link swings to the next, and the address bar is the page.
 */
const routes: PluridRoute<any>[] = [
    {
        value: '/',
        planes: [
            ['/home', Home],
            ['/about', About],
        ],
        view: ['/home'],
        defaultConfiguration: {
            space: {
                presentation: 'page',
            },
        },
    },
];


export default routes;
