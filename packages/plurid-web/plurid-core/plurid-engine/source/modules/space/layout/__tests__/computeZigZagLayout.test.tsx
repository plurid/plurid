// #region imports
    // #region libraries
    import {
        /** constants */
        defaultTreePlane,
        defaultConfiguration,

        /** interfaces */
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import computeZigZagLayout from '../zigZag';
    // #endregion external
// #endregion imports



// #region module
describe('computeZigZagLayout', () => {
    /** handle crypto for jest - https://stackoverflow.com/a/52612372 */
    const crypto = require('crypto');
    Object.defineProperty(global, 'crypto', {
        value: {
            getRandomValues: (arr: any) => crypto.randomBytes(arr.length),
        },
    });

    Object.defineProperty(window, 'innerWidth', {
        value: 1200,
    });
    Object.defineProperty(window, 'innerHeight', {
        value: 800,
    });


    it('computes the default zig zag layout', () => {
        const treePages: TreePlane[] = [
            {
                ...defaultTreePlane,
                sourceID: '1',
                location: {
                    rotateX: 0,
                    rotateY: 45,
                    translateX: 0,
                    translateY: 0,
                    translateZ: 0,
                },
                route: '/page-1',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '2',
                location: {
                    rotateX: 0,
                    rotateY: -45,
                    translateX: 0,
                    translateY: 850,
                    translateZ: 0,
                },
                route: '/page-2',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                location: {
                    rotateX: 0,
                    rotateY: 45,
                    translateX: 0,
                    translateY: 1700,
                    translateZ: 0,
                },
                route: '/page-3',
                planeID: '',
                show: true,
            },
        ];

        const locatedTree: TreePlane[] = [
            {
                ...defaultTreePlane,
                sourceID: '1',
                location: {
                    rotateX: 0,
                    rotateY: 45,
                    translateX: 0,
                    translateY: 0,
                    translateZ: 0,
                },
                route: '/page-1',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '2',
                location: {
                    rotateX: 0,
                    rotateY: -45,
                    translateX: 0,
                    translateY: 850,
                    translateZ: 0,
                },
                route: '/page-2',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                location: {
                    rotateX: 0,
                    rotateY: 45,
                    translateX: 0,
                    translateY: 1700,
                    translateZ: 0,
                },
                route: '/page-3',
                planeID: '',
                show: true,
            },
        ];

        const result = computeZigZagLayout(treePages);
        const resultWithEmptyIDs = result.map(page => {
            return { ...page, planeID: ''};
        });

        expect(resultWithEmptyIDs).toStrictEqual(locatedTree);
    });

    it('stacks mixed declared heights without overlap (each row as tall as its plane)', () => {
        const sized = (id: string, height: number): TreePlane => ({
            ...defaultTreePlane, sourceID: id, route: '/' + id, planeID: id, show: true, width: 300, height, sizeMode: 'declared',
        });
        const tree = computeZigZagLayout([sized('a', 200), sized('b', 400), sized('c', 300)], 30, defaultConfiguration, { width: 1200, height: 800 });
        const heights = [200, 400, 300];
        for (let index = 1; index < tree.length; index += 1) {
            expect(tree[index].location.translateY).toBeGreaterThanOrEqual(tree[index - 1].location.translateY + heights[index - 1]);
        }
        expect(tree.map((plane) => Math.abs(plane.location.rotateY))).toEqual([30, 30, 30]);
    });

});
// #endregion module
