import {
    match,
} from '../';

import {
    Route,
} from '../interfaces';



export type GENERAL_SPACE = 'GENERAL/SPACE';
export type GENERAL_EXPLORE = 'GENERAL/EXPLORE';
export type GENERAL_LIST = 'GENERAL/LIST';
export type GENERAL_ADD = 'GENERAL/ADD';

export type GENERAL_VIEW_TYPE = GENERAL_SPACE
    | GENERAL_EXPLORE
    | GENERAL_LIST
    | GENERAL_ADD;

export interface GeneralView {
    SPACE: GENERAL_SPACE;
    EXPLORE: GENERAL_EXPLORE;
    LIST: GENERAL_LIST,
    ADD: GENERAL_ADD;
}

export const GENERAL_VIEW: GeneralView = {
    SPACE: 'GENERAL/SPACE',
    EXPLORE: 'GENERAL/EXPLORE',
    LIST: 'GENERAL/LIST',
    ADD: 'GENERAL/ADD',
};


const routes: Route<GENERAL_VIEW_TYPE>[] = [
    {
        path: '/',
        view: GENERAL_VIEW.SPACE,
    },
    {
        path: '/explore',
        view: GENERAL_VIEW.EXPLORE,
    },
    {
        path: '/list/:list',
        view: GENERAL_VIEW.LIST,
    },
    {
        path: '/:add',
        view: GENERAL_VIEW.ADD,
        length: 4,
        lengthType: '==',
    },
];


describe('clientRouter.match', () => {
    it('basic', () => {
        const path = '/';
        const route = match(path, routes);
        expect(route?.path).toBe('/');
    });

    it('parametric', () => {
        const path = '/list/foo';
        const route = match(path, routes);
        expect(route?.parameters?.list).toBe('foo');
    });

    it('parametric with length', () => {
        const path = '/asdf';
        const route = match(path, routes);
        expect(route?.parameters?.add).toBe('asdf');
    });
});
